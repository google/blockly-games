##############################
# Definitions
##############################

USER_APPS = {index,puzzle,maze,bird,turtle,movie,pond/docs,pond/basic,pond/advanced}
ALL_JSON = {./,index,puzzle,maze,bird,turtle,movie,pond/docs,pond,pond/basic,pond/advanced}
ALL_TEMPLATES = appengine/template.soy,appengine/index/template.soy,appengine/puzzle/template.soy,appengine/maze/template.soy,appengine/bird/template.soy,appengine/turtle/template.soy,appengine/movie/template.soy,appengine/pond/docs/template.soy,appengine/pond/template.soy,appengine/pond/basic/template.soy,appengine/pond/advanced/template.soy

JS_READ_ONLY = appengine/js-read-only
SOY_COMPILER = java -jar closure-templates-read-only/build/SoyToJsSrcCompiler.jar --shouldProvideRequireSoyNamespaces
SOY_EXTRACTOR = java -jar closure-templates-read-only/build/SoyMsgExtractor.jar

BLOCKY_DIR = $(PWD)

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

pond-docs-en:
	$(SOY_COMPILER) --outputPathFormat appengine/pond/docs/generated/en/soy.js --srcs appengine/pond/docs/template.soy
	python build-app.py pond/docs en

pond-basic-en: pond-common-en
	$(SOY_COMPILER) --outputPathFormat appengine/pond/basic/generated/en/soy.js --srcs appengine/pond/basic/template.soy
	python build-app.py pond/basic en

pond-advanced-en: pond-common-en
	$(SOY_COMPILER) --outputPathFormat appengine/pond/advanced/generated/en/soy.js --srcs appengine/pond/advanced/template.soy
	python build-app.py pond/advanced en

pattern-en: common-en
	$(SOY_COMPILER) --outputPathFormat appengine/pattern/generated/en/soy.js --srcs appengine/pattern/template.soy
	python build-app.py pattern en

pond-common-en: common-en
	$(SOY_COMPILER) --outputPathFormat appengine/pond/generated/en/soy.js --srcs appengine/pond/template.soy
common-en:
	$(SOY_COMPILER) --outputPathFormat appengine/generated/en/soy.js --srcs appengine/template.soy

en: index-en puzzle-en maze-en bird-en turtle-en movie-en pond-docs-en pond-basic-en pond-advanced-en

languages:
	$(SOY_EXTRACTOR) --outputFile extracted_msgs.xlf --srcs $(ALL_TEMPLATES)
	i18n/xliff_to_json.py --xlf extracted_msgs.xlf --templates $(ALL_TEMPLATES)
	@for app in $(ALL_JSON); do \
	  mkdir -p appengine/$$app/generated; \
	  i18n/json_to_js.py --path_to_jar closure-templates-read-only/build --output_dir appengine/$$app/generated --template appengine/$$app/template.soy --key_file json/keys.json json/*.json; \
	done
	@for app in $(USER_APPS); do \
	  echo; \
	  echo --- $$app; \
	  for lang in `ls appengine/$$app/generated`; do \
	    python build-app.py $$app $$lang; \
	  done \
	done

deps:
	mkdir -p $(JS_READ_ONLY)

	svn checkout https://github.com/google/closure-library/trunk/closure/goog/ $(JS_READ_ONLY)/goog
	svn checkout https://github.com/google/closure-library/trunk/third_party/closure/goog/ $(JS_READ_ONLY)/third_party_goog
	svn checkout https://github.com/google/closure-library/trunk/closure/bin/ closure-library-bin-read-only

	svn checkout http://closure-templates.googlecode.com/svn/trunk/ closure-templates-read-only
	(cd closure-templates-read-only; ant SoyToJsSrcCompiler)
	(cd closure-templates-read-only; ant SoyMsgExtractor)
	cp -r closure-templates-read-only/javascript/soyutils_usegoog.js $(JS_READ_ONLY)

	svn checkout https://github.com/google/closure-compiler/trunk/ closure-compiler-read-only
	(cd closure-compiler-read-only; ant jar)
	chmod +x closure-library-bin-read-only/build/closurebuilder.py

	svn checkout https://github.com/NeilFraser/JS-Interpreter/trunk/ $(JS_READ_ONLY)/JS-Interpreter
	java -jar closure-compiler-read-only/build/compiler.jar --js appengine/js-read-only/JS-Interpreter/acorn.js --js appengine/js-read-only/JS-Interpreter/interpreter.js --js_output_file appengine/js-read-only/JS-Interpreter/compiled.js

	svn checkout https://github.com/ajaxorg/ace-builds/trunk/src-min-noconflict/ $(JS_READ_ONLY)/ace

	mkdir -p $(JS_READ_ONLY)/blockly
	svn checkout https://github.com/google/blockly/trunk/core $(JS_READ_ONLY)/blockly/core
	svn checkout https://github.com/google/blockly/trunk/blocks $(JS_READ_ONLY)/blockly/blocks
	svn checkout https://github.com/google/blockly/trunk/generators $(JS_READ_ONLY)/blockly/generators
	svn checkout https://github.com/google/blockly/trunk/msg/js $(JS_READ_ONLY)/blockly/msg-js

clean: clean-languages clean-deps

clean-languages:
	rm -rf appengine/$(ALL_JSON)/generated
	rm -f json/keys.json

clean-deps:
	rm -rf appengine/js-read-only
	rm -rf closure-compiler-read-only
	rm -rf closure-library-bin-read-only
	rm -rf closure-templates-read-only

# Prevent non-traditional rules from exiting with no changes.
.PHONY: deps
