##############################
# Definitions
##############################

USER_APPS = {index,puzzle,maze,bird,turtle,movie,music,pond/docs,pond/tutor,pond/duck,gallery}
ALL_JSON = {./,index,puzzle,maze,bird,turtle,movie,music,pond/docs,pond,pond/tutor,pond/duck,gallery}
ALL_TEMPLATES = appengine/template.soy,appengine/index/template.soy,appengine/puzzle/template.soy,appengine/maze/template.soy,appengine/bird/template.soy,appengine/turtle/template.soy,appengine/movie/template.soy,appengine/music/template.soy,appengine/pond/docs/template.soy,appengine/pond/template.soy,appengine/pond/tutor/template.soy,appengine/pond/duck/template.soy,appengine/gallery/template.soy

APP_ENGINE_THIRD_PARTY = appengine/third-party
SOY_COMPILER = java -jar third-party/SoyToJsSrcCompiler.jar --shouldProvideRequireSoyNamespaces --isUsingIjData
SOY_EXTRACTOR = java -jar third-party/SoyMsgExtractor.jar

REQUIRED_BINS = svn unzip wget java python sed

##############################
# Rules
##############################

all: deps languages

index-en:
	mkdir -p appengine/generated/en/
	$(SOY_COMPILER) --outputPathFormat appengine/index/generated/en/soy.js --srcs appengine/index/template.soy
	python build-app.py index en

puzzle-en: common-en
	$(SOY_COMPILER) --outputPathFormat appengine/puzzle/generated/en/soy.js --srcs appengine/puzzle/template.soy
	python build-app.py puzzle en

maze-en: common-en
	$(SOY_COMPILER) --outputPathFormat appengine/maze/generated/en/soy.js --srcs appengine/maze/template.soy
	python build-app.py maze en

bird-en: common-en
	$(SOY_COMPILER) --outputPathFormat appengine/bird/generated/en/soy.js --srcs appengine/bird/template.soy
	python build-app.py bird en

turtle-en: common-en
	$(SOY_COMPILER) --outputPathFormat appengine/turtle/generated/en/soy.js --srcs appengine/turtle/template.soy
	python build-app.py turtle en

movie-en: common-en
	$(SOY_COMPILER) --outputPathFormat appengine/movie/generated/en/soy.js --srcs appengine/movie/template.soy
	python build-app.py movie en

music-en: common-en
	$(SOY_COMPILER) --outputPathFormat appengine/music/generated/en/soy.js --srcs appengine/music/template.soy
	python build-app.py music en

pond-docs-en:
	mkdir -p appengine/pond/generated/en/
	$(SOY_COMPILER) --outputPathFormat appengine/pond/docs/generated/en/soy.js --srcs appengine/pond/docs/template.soy
	python build-app.py pond/docs en

pond-tutor-en: pond-common-en
	$(SOY_COMPILER) --outputPathFormat appengine/pond/tutor/generated/en/soy.js --srcs appengine/pond/tutor/template.soy
	python build-app.py pond/tutor en

pond-duck-en: pond-common-en
	$(SOY_COMPILER) --outputPathFormat appengine/pond/duck/generated/en/soy.js --srcs appengine/pond/duck/template.soy
	python build-app.py pond/duck en

genetics-en: common-en
	$(SOY_COMPILER) --outputPathFormat appengine/genetics/generated/en/soy.js --srcs appengine/genetics/template.soy
	python build-app.py genetics en

gallery-en: common-en
	$(SOY_COMPILER) --outputPathFormat appengine/gallery/generated/en/soy.js --srcs appengine/gallery/template.soy
	python build-app.py gallery en

pond-common-en: common-en
	$(SOY_COMPILER) --outputPathFormat appengine/pond/generated/en/soy.js --srcs appengine/pond/template.soy

common-en:
	$(SOY_COMPILER) --outputPathFormat appengine/generated/en/soy.js --srcs appengine/template.soy

en: index-en puzzle-en maze-en bird-en turtle-en movie-en music-en pond-docs-en pond-tutor-en pond-duck-en genetics-en gallery-en

index puzzle maze bird turtle movie music gallery: common
	@echo "Generating JS from appengine/$@/template.soy"
	mkdir -p appengine/$@/generated;
	i18n/json_to_js.py --output_dir appengine/$@/generated --template appengine/$@/template.soy json/*.json;
	python build-app.py $@
	@echo

pond-docs: pond-common
	@echo "Generating JS from appengine/pond/docs/template.soy"
	mkdir -p appengine/pond/docs/generated;
	i18n/json_to_js.py --output_dir appengine/pond/docs/generated --template appengine/pond/docs/template.soy json/*.json;
	python build-app.py pond/docs
	@echo

pond-tutor: pond-common
	@echo "Generating JS from appengine/pond/tutor/template.soy"
	mkdir -p appengine/pond/tutor/generated;
	i18n/json_to_js.py --output_dir appengine/pond/tutor/generated --template appengine/pond/tutor/template.soy json/*.json;
	python build-app.py pond/tutor
	@echo

pond-duck: pond-common
	@echo "Generating JS from appengine/pond/duck/template.soy"
	mkdir -p appengine/pond/duck/generated;
	i18n/json_to_js.py --output_dir appengine/pond/duck/generated --template appengine/pond/duck/template.soy json/*.json;
	python build-app.py pond/duck
	@echo

pond-common: common
	@echo "Generating JS from appengine/pond/template.soy"
	mkdir -p appengine/pond/generated;
	i18n/json_to_js.py --output_dir appengine/pond/generated --template appengine/pond/template.soy json/*.json;
	@echo

common: soy-to-json
	@echo "Generating JS from appengine/template.soy"
	mkdir -p appengine/generated;
	i18n/json_to_js.py --output_dir appengine/generated --template appengine/template.soy json/*.json;
	@echo

soy-to-json:
	@echo "Converting Soy files to JSON for Translatewiki."
	@# Create extracted_msgs.xlf with all messages from all soy files.
	$(SOY_EXTRACTOR) --outputFile extracted_msgs.xlf --srcs $(ALL_TEMPLATES)
	@# Creates json/en.json, json/qqq.json, json/keys.json.
	@# Deletes extracted_msgs.xlf
	i18n/xliff_to_json.py --xlf extracted_msgs.xlf --templates $(ALL_TEMPLATES)
	@echo

languages: soy-to-json
	@for app in $(ALL_JSON); do \
	  echo "Generating JS from appengine/$$app/template.soy"; \
	  mkdir -p appengine/$$app/generated; \
	  i18n/json_to_js.py --output_dir appengine/$$app/generated --template appengine/$$app/template.soy json/*.json; \
	  echo; \
	done
	@for app in $(USER_APPS); do \
	  python build-app.py $$app; \
	done

deps:
	$(foreach bin,$(REQUIRED_BINS),\
	    $(if $(shell command -v $(bin) 2> /dev/null),$(info Found `$(bin)`),$(error Please install `$(bin)`)))
	@# All following commands are in third-party, use backslashes to keep them on the same line as the cd command.
	cd third-party; \
	svn checkout https://github.com/google/closure-library/trunk/closure/bin/build build; \
	wget -N https://dl.google.com/closure-templates/closure-templates-for-javascript-latest.zip; \
	unzip -o closure-templates-for-javascript-latest.zip SoyToJsSrcCompiler.jar; \
	unzip -o closure-templates-for-javascript-latest.zip -d ../$(APP_ENGINE_THIRD_PARTY) soyutils_usegoog.js; \
	wget -N https://dl.google.com/closure-templates/closure-templates-msg-extractor-latest.zip; \
	unzip -o closure-templates-msg-extractor-latest.zip SoyMsgExtractor.jar; \
	wget -N https://dl.google.com/closure-compiler/compiler-latest.zip; \
	unzip -o compiler-latest.zip -x COPYING README.md; \
	mv -f closure-compiler-v*.jar closure-compiler.jar; \
	chmod +x build/closurebuilder.py

	mkdir -p $(APP_ENGINE_THIRD_PARTY)
	svn checkout https://github.com/google/closure-library/trunk/closure/goog/ $(APP_ENGINE_THIRD_PARTY)/goog
	svn checkout https://github.com/google/closure-library/trunk/third_party/closure/goog/ $(APP_ENGINE_THIRD_PARTY)/third_party_goog
	svn checkout https://github.com/ajaxorg/ace-builds/trunk/src-min-noconflict/ $(APP_ENGINE_THIRD_PARTY)/ace
	svn checkout https://github.com/google/blockly/branches/develop/ $(APP_ENGINE_THIRD_PARTY)/blockly
	svn checkout https://github.com/CreateJS/SoundJS/trunk/lib/ $(APP_ENGINE_THIRD_PARTY)/SoundJS
	cp -R third-party/soundfonts $(APP_ENGINE_THIRD_PARTY)/

	@# messages.js confuses the compiler by also providing "Blockly.Msg.en".
	rm $(APP_ENGINE_THIRD_PARTY)/blockly/msg/messages.js

	svn checkout https://github.com/NeilFraser/JS-Interpreter/trunk/ $(APP_ENGINE_THIRD_PARTY)/JS-Interpreter
	@# Remove @license tag so compiler will strip Google's license.
	sed 's/@license//' $(APP_ENGINE_THIRD_PARTY)/JS-Interpreter/interpreter.js > $(APP_ENGINE_THIRD_PARTY)/JS-Interpreter/interpreter_.js
	@# Compile JS-Interpreter using SIMPLE_OPTIMIZATIONS because the Music game needs to mess with the stack.
	java -jar third-party/closure-compiler.jar\
	 --language_out ECMASCRIPT5_STRICT\
	 --js $(APP_ENGINE_THIRD_PARTY)/JS-Interpreter/acorn.js\
	 --js $(APP_ENGINE_THIRD_PARTY)/JS-Interpreter/interpreter_.js\
	 --js_output_file $(APP_ENGINE_THIRD_PARTY)/JS-Interpreter/compressed.js
	rm $(APP_ENGINE_THIRD_PARTY)/JS-Interpreter/interpreter_.js

clean: clean-languages clean-deps

clean-languages:
	rm -rf appengine/$(ALL_JSON)/generated
	rm -f json/keys.json

clean-deps:
	mv third-party/soundfonts third-party-soundfonts
	rm -rf $(APP_ENGINE_THIRD_PARTY)
	rm -rf third-party
	mkdir -p third-party
	mv third-party-soundfonts third-party/soundfonts

# Prevent non-traditional rules from exiting with no changes.
.PHONY: deps
