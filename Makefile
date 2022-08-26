##############################
# Definitions
##############################

APP_ENGINE_THIRD_PARTY = appengine/third-party

REQUIRED_BINS = svn wget java python sed

##############################
# Rules
##############################

all: deps games

index: common
	python build/compress.py index

puzzle: common
	python build/compress.py puzzle

maze: common
	python build/compress.py maze

bird: common
	python build/compress.py bird

turtle: common
	python build/compress.py turtle

movie: common
	python build/compress.py movie

music: common
	python build/compress.py music

pond-tutor: common
	python build/compress.py pond/tutor

pond-duck: common
	python build/compress.py pond/duck

gallery: common
	python build/compress.py gallery

games: index puzzle maze bird turtle movie music pond-tutor pond-duck gallery

common:
	@echo "Converting messages.js to JSON for Translatewiki."
	python build/js_to_json.py
	@echo "Converting JSON from Translatewiki to message files."
	python build/json_to_js.py
	@echo

deps:
	$(foreach bin,$(REQUIRED_BINS),\
	    $(if $(shell command -v $(bin) 2> /dev/null),$(info Found `$(bin)`),$(error Please install `$(bin)`)))
	mkdir -p third-party-downloads
	@# All following commands are in third-party-downloads, use backslashes to keep them on the same line as the cd command.
	cd third-party-downloads; \
	wget -N https://unpkg.com/google-closure-compiler-java/compiler.jar; \
	mv -f compiler.jar closure-compiler.jar; \

	mkdir -p $(APP_ENGINE_THIRD_PARTY)
	wget -N https://unpkg.com/@babel/standalone@7.14.8/babel.min.js
	mv babel.min.js $(APP_ENGINE_THIRD_PARTY)/
	@# GitHub doesn't support git archive, so download files using svn.
	svn export --force https://github.com/ajaxorg/ace-builds/trunk/src-min-noconflict/ $(APP_ENGINE_THIRD_PARTY)/ace
	mkdir -p $(APP_ENGINE_THIRD_PARTY)/blockly
	svn export --force https://github.com/NeilFraser/blockly-for-BG/trunk/blocks/ $(APP_ENGINE_THIRD_PARTY)/blockly/blocks
	svn export --force https://github.com/NeilFraser/blockly-for-BG/trunk/core/ $(APP_ENGINE_THIRD_PARTY)/blockly/core
	svn export --force https://github.com/NeilFraser/blockly-for-BG/trunk/externs/ $(APP_ENGINE_THIRD_PARTY)/blockly/externs
	svn export --force https://github.com/NeilFraser/blockly-for-BG/trunk/generators/ $(APP_ENGINE_THIRD_PARTY)/blockly/generators
	svn export --force https://github.com/NeilFraser/blockly-for-BG/trunk/media/ $(APP_ENGINE_THIRD_PARTY)/blockly/media
	svn export --force https://github.com/NeilFraser/blockly-for-BG/trunk/msg/ $(APP_ENGINE_THIRD_PARTY)/blockly/msg
	svn export --force https://github.com/CreateJS/SoundJS/trunk/lib/ $(APP_ENGINE_THIRD_PARTY)/SoundJS
	cp third-party/base.js $(APP_ENGINE_THIRD_PARTY)/
	cp -R third-party/soundfonts $(APP_ENGINE_THIRD_PARTY)/

	svn export --force https://github.com/NeilFraser/JS-Interpreter/trunk/ $(APP_ENGINE_THIRD_PARTY)/JS-Interpreter
	@# Remove @license tag so compiler will strip Google's license.
	sed 's/@license//' $(APP_ENGINE_THIRD_PARTY)/JS-Interpreter/interpreter.js > $(APP_ENGINE_THIRD_PARTY)/JS-Interpreter/interpreter_.js
	@# Compile JS-Interpreter using SIMPLE_OPTIMIZATIONS because the Music game needs to mess with the stack.
	java -jar third-party-downloads/closure-compiler.jar\
	  --language_out ECMASCRIPT5\
	  --language_in ECMASCRIPT5\
	  --js $(APP_ENGINE_THIRD_PARTY)/JS-Interpreter/acorn.js\
	  --js $(APP_ENGINE_THIRD_PARTY)/JS-Interpreter/interpreter_.js\
	  --js_output_file $(APP_ENGINE_THIRD_PARTY)/JS-Interpreter/compressed.js
	rm $(APP_ENGINE_THIRD_PARTY)/JS-Interpreter/interpreter_.js

offline: clean-offline
	mkdir offline
	cp -R appengine offline/blockly-games
	rm -f offline/blockly-games/*.{yaml,py,sh}
	rm -f offline/blockly-games/{admin.html,apple-touch-icon.png,favicon.ico,robots.txt}
	rm -rf offline/blockly-games/gallery*
	rm -rf offline/blockly-games/generated/
	rm -rf offline/blockly-games/{./,*,*/*}/src
	rm -f offline/blockly-games/{./,*,*/*}/generated/uncompressed.js
	rm -f offline/blockly-games/index/title.png
	rm -f offline/blockly-games/pond/crobots.txt
	rm -rf offline/blockly-games/pond/battle
	rm -f offline/blockly-games/common/stripes.svg
	rm -f offline/blockly-games/third-party/base.js
	rm -f offline/blockly-games/third-party/soundfonts/README.txt

	mv offline/blockly-games/third-party/ace/{ace.js,mode-javascript.js,theme-chrome.js,worker-javascript.js} offline/
	rm -rf offline/blockly-games/third-party/ace/*
	mv offline/{ace.js,mode-javascript.js,theme-chrome.js,worker-javascript.js} offline/blockly-games/third-party/ace/

	mv offline/blockly-games/third-party/SoundJS/soundjs.min.js offline/
	rm -rf offline/blockly-games/third-party/SoundJS/*
	mv offline/soundjs.min.js offline/blockly-games/third-party/SoundJS/

	mv offline/blockly-games/third-party/blockly/media/ offline/
	rm -f offline/media/{pilcrow.png,sprites.svg}
	rm -rf offline/blockly-games/third-party/blockly/*
	mv offline/media/ offline/blockly-games/third-party/blockly/

	mv offline/blockly-games/third-party/JS-Interpreter/compressed.js offline/
	rm -rf offline/blockly-games/third-party/JS-Interpreter/{*,.gitignore}
	mv offline/compressed.js offline/blockly-games/third-party/JS-Interpreter/

	echo '<html><head><meta http-equiv=refresh content="0; url=blockly-games/index.html"/></head></html>' > offline/blockly-games.html
	find offline -name '.DS_Store' -delete

	cd offline; \
	zip -r9 blockly-games.zip blockly-games/ blockly-games.html

clean: clean-games clean-offline clean-deps

clean-games:
	rm -rf appengine/{.,index,puzzle,maze,bird,turtle,movie,music,pond,pond/tutor,pond/duck,gallery}/generated

clean-offline:
	rm -rf offline/

clean-deps:
	rm -rf $(APP_ENGINE_THIRD_PARTY)
	rm -rf third-party-downloads

# Prevent non-traditional rules from exiting with no changes.
.PHONY: deps
