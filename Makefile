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
	python build-app.py index

puzzle: common
	python build-app.py puzzle

maze: common
	python build-app.py maze

bird: common
	python build-app.py bird

turtle: common
	python build-app.py turtle

movie: common
	python build-app.py movie

music: common
	python build-app.py music

pond-tutor: common
	python build-app.py pond/tutor

pond-duck: common
	python build-app.py pond/duck

gallery: common
	python build-app.py gallery

games: index puzzle maze bird turtle movie music pond-tutor pond-duck gallery

common:
	@echo "Converting messages.js to JSON for Translatewiki."
	python i18n/js_to_json.py
	@echo "Converting JSON from Translatewiki to message files."
	python i18n/json_to_js.py
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
	  --language_out ECMASCRIPT5_STRICT\
	  --js $(APP_ENGINE_THIRD_PARTY)/JS-Interpreter/acorn.js\
	  --js $(APP_ENGINE_THIRD_PARTY)/JS-Interpreter/interpreter_.js\
	  --js_output_file $(APP_ENGINE_THIRD_PARTY)/JS-Interpreter/compressed.js
	rm $(APP_ENGINE_THIRD_PARTY)/JS-Interpreter/interpreter_.js

clean: clean-games clean-deps

clean-games:
	rm -rf appengine/{.,index,puzzle,maze,bird,turtle,movie,music,pond,pond/tutor,pond/duck,gallery}/generated
	rm -f json/keys.json

clean-deps:
	rm -rf $(APP_ENGINE_THIRD_PARTY)
	rm -rf third-party-downloads

# Prevent non-traditional rules from exiting with no changes.
.PHONY: deps
