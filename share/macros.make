#-  GNU Makefile

#-  macros.make ~~
#
#   This contains lots of useful definitions I have written for GNU Makefiles.
#   I have gathered them so I can include them in other Makefiles conveniently
#   and "traceably". This helps me considerably in debugging, both by storing
#   the already-debugged forms and also by storing things at a fixed filepath.
#
#   NOTE: Documentation has been removed but will be added again later (maybe).
#
#   NOTE: I have discontinued the use of JS minifiers / optimizers until I get
#   a chance to evaluate appropriate testing frameworks. The fact that I just
#   wasted a bunch of time tracking down "bugs" that were due to the usage of
#   Google's Closure compiler in WHITESPACE_ONLY optimization mode is absurd.
#   When I can test for regressions instantly, I will reconsider. UGH.
#
#                                                       ~~ (c) SRW, 27 Nov 2012
#                                                   ~~ last updated 21 Jan 2015

SHELL   :=  sh
ECHO    :=  echo -e

.SUFFIXES: ;

define alert
    $(call red-printf, 'Error: %s\n', $(strip $(1))) >&2
endef

define aside
    $(call gray-printf, '--> %s\n', $(strip $(1)))
endef

define available
    $(shell \
        for each in $(1); do                                                \
            command -v $${each} >/dev/null 2>&1                         ;   \
            if [ $$? -eq 0 ]; then                                          \
                command -v $${each}                                     ;   \
            fi                                                          ;   \
        done                                                                \
    )
endef

define check-js-syntax
    $(call aside, "Checking syntax of $(1) ...")                        ;   \
    $(NODEJS) $(SHARE_DIR)/check-js-syntax.js $(1)                      ;   \
    if [ $$? -ne 0 ]; then                                                  \
        exit 1                                                          ;   \
    fi
endef

define compile-js
    if [ $(words $(1)) -eq 1 ]; then                                        \
        $(call aside, "Optimizing script: $(1) -> $(2)")                ;   \
    else                                                                    \
        $(call aside, "Optimizing scripts: $(1) -> $(2)")               ;   \
    fi                                                                  ;   \
    if [ "$(strip $(MINIFY))" = "$(firstword $(CLOSURE))" ]; then           \
        $(CLOSURE) --compilation_level WHITESPACE_ONLY                      \
            $(1:%=--js %) --js_output_file $(2)                         ;   \
    elif [ "$(strip $(MINIFY))" = "$(firstword $(YUICOMP))" ]; then         \
        $(YUICOMP) --nomunge --preserve-semi --disable-optimizations        \
            --type js $(1) -o $(2)                                      ;   \
    else                                                                    \
        $(CAT) $(1) > $(2)                                              ;   \
    fi
endef

define contingent
    $(shell \
        contingent() {                                                      \
            for each in $$@; do                                             \
                command -v $${each} >/dev/null 2>&1                     ;   \
                if [ $$? -eq 0 ]; then                                      \
                    command -v $${each}                                 ;   \
                    return $$?                                          ;   \
                fi                                                      ;   \
            done                                                        ;   \
            printf 'echo "\033[1;31m(%s)\033[1;0m"' '$(firstword $(1))' ;   \
            return 1                                                    ;   \
        }                                                               ;   \
        contingent $(1)                                                     \
    )
endef

define cyan-printf
    printf '\033[1;36m'$(strip $(1))'\033[1;0m' $(strip $(2))
endef

define download-url
    $(call aside, 'Retrieving $(notdir $@) ...')                        ;   \
    $(NODEJS) $(SHARE_DIR)/download.js $(1) $@                          ;   \
    if [ $$? -ne 0 ]; then                                                  \
        if [ -f $(CODEBANK)/lib/JavaScript/$(notdir $@) ]; then             \
            $(CP) $(CODEBANK)/lib/JavaScript/$(notdir $@) $@            ;   \
        elif [ -f $(CODEBANK)/lib/CSS/$(notdir $@) ]; then                  \
            $(CP) $(CODEBANK)/lib/CSS/$(notdir $@) $@                   ;   \
        else                                                                \
            $(call alert, 'Unable to retrieve $(notdir $@).')           ;   \
            exit 1                                                      ;   \
        fi                                                              ;   \
    fi
endef

define generate-image-from
    $(call aside, 'Generating $(notdir $@) ...')                        ;   \
    $(CONVERT) $(2) $(3) $(1) $@
endef

define gray-printf
    printf '\033[1;30m'$(strip $(1))'\033[1;0m' $(strip $(2))
endef

define hilite
    $(call cyan-printf, '--> %s\n', $(strip $(1)))
endef

define make-directory
    if [ ! -d "$(strip $(1))" ]; then $(MKDIR) "$(strip $(1))"; fi
endef

define minify-css
    if [ $(words $(1)) -eq 1 ]; then                                        \
        $(call aside, "Optimizing stylesheet: $(1) -> $(2)")            ;   \
    else                                                                    \
        $(call aside, "Optimizing stylesheets: $(1) -> $(2)")           ;   \
    fi                                                                  ;   \
    echo "/*! $(QM_WWW_URL)/$(notdir $(2)) */\n" > $(2)                 ;   \
    $(CAT) $(1) > $(2)-temp.js                                          ;   \
    if [ "$(firstword $(YUICOMP))" != "echo" ]; then                        \
        $(YUICOMP) --type css $(2)-temp.js -o $(2)-temp.js              ;   \
    fi                                                                  ;   \
    $(CAT) $(2)-temp.js >> $(2)                                         ;   \
    $(RM) $(2)-temp.js
endef

define minify-js
    if [ "$(strip $(MINIFY))" = "$(firstword $(CLOSURE))" ]; then           \
        echo "// $(QM_WWW_URL)/$(notdir $(2))\n" > $(2)                 ;   \
        $(CLOSURE) --compilation_level WHITESPACE_ONLY                      \
            $(1:%=--js %) >> $(2)                                       ;   \
    elif [ "$(strip $(MINIFY))" = "$(firstword $(YUICOMP))" ]; then         \
        echo "// $(QM_WWW_URL)/$(notdir $(2))\n" > $(2)                 ;   \
        $(YUICOMP) --nomunge --preserve-semi --disable-optimizations        \
            --type js $(1) >> $(2)                                      ;   \
    elif [ "$(strip $(MINIFY))" = "$(firstword $(JSMIN))" ]; then           \
        $(CAT) $(1) | $(JSMIN) "$(QM_WWW_URL)/$(notdir $(2))" > $(2)    ;   \
    else                                                                    \
        echo "// $(QM_WWW_URL)/$(notdir $(2))\n" > $(2)                 ;   \
        $(CAT) $(1) >> $(2)                                             ;   \
    fi
endef

define open-in-browser
    $(strip $(foreach page, $(1),                                           \
        browser="$(call contingent,                                         \
            gnome-www-browser gnome-open xdg-open x-www-browser open)"  ;   \
        $(if $(filter http%,$(page)),                                       \
            $${browser} $(page),                                            \
            if [ -f $(page) ]; then                                         \
                $${browser} $(page)                                     ;   \
            fi                                                          ;   \
        )                                                                   \
    ))
endef

define red-printf
    printf '\033[1;31m'$(strip $(1))'\033[1;0m' $(strip $(2))
endef

#-  NOTE: The Spidermonkey shell currently warns that '//@ sourceMappingURL' is
#   being deprecated in favor of '//# sourceMappingURL', so I have modified the
#   pattern below just in case ...
#                                                           ~~ SRW, 02 Sep 2013

define remove-source-maps
    $(SED) -e '/\/\/[@#] sourceMappingURL=/d' $(1) > $(1).bak           ;   \
    $(CP) $(1).bak $(1)                                                 ;   \
    $(RM) $(1).bak
endef

define replace-iso-date
    $(SED) -e \
        's|\(<lastmod>\).*\(</lastmod>\)|\1$(shell $(DATE) '+%Y-%m-%d')\2|g' \
            $(1) > $(2)
endef

define replace-url-macros
    $(SED) \
        -e 's|LOCAL_ADDR|$(strip $(LOCAL_ADDR))|g'      \
        -e 's|https://api.qmachine.org|QM_API_URL|g'    \
        -e 's|QM_API_URL|$(strip $(QM_API_URL))|g'      \
        -e 's|QM_WWW_URL|$(strip $(QM_WWW_URL))|g'  $(1) > $(2)
endef

# The following definition executes the command in the Heroku Procfile in the
# foreground for all environments except Travis CI. It was inspired by the code
# used to test SproutCore -- see http://goo.gl/IwW2o9.

define run-procfile
    LAUNCH_COMMAND=`$(SED) 's/web:[[:space:]]*//' Procfile`             ;   \
    if [ -z $${TRAVIS_JOB_ID} ]; then                                       \
        $(1) $(SHELL) -c "$${LAUNCH_COMMAND}" || $(TRUE)                ;   \
    else                                                                    \
        ( $(1) $(SHELL) -c "$${LAUNCH_COMMAND}" & ) || $(TRUE)          ;   \
    fi
endef

define show-usage-info
    printf '%s\n' 'Usage: $(MAKE) [options] [target] ...'               ;   \
    printf '%s\n' '  where "high-level" targets include'                ;   \
    $(SED) -n 's/^.PHONY:\([^$$]*\)$$/\1/p' $(MAKEFILE_LIST) | \
        $(XARGS) printf '    %s\n' | $(SORT)
endef

define timestamp
    $(CP) $(1) $(2)                                                     ;   \
    printf '#-  %s\n' "`$(DATE)`" >> $(2)
endef

BUNDLE      :=  $(call contingent, bundle)
CAT         :=  $(call contingent, gcat cat)
CD          :=  $(call contingent, cd)
CLOSURE     :=  $(call contingent, closure-compiler)
CONVERT     :=  $(call contingent, convert)
CP          :=  $(call contingent, gcp cp) -rf
DATE        :=  TZ=GMT $(call contingent, gdate date)
GEM         :=  $(call contingent, gem)
GIT         :=  $(call contingent, git)
JSMIN       :=  $(call contingent, jsmin)
LN          :=  $(call contingent, gln ln) -fs
LS          :=  $(call contingent, gls ls) 2>/dev/null
MKDIR       :=  $(call contingent, gmkdir mkdir)
MINIFY      :=  $(call contingent, cat closure-compiler yuicompressor jsmin)
NODEJS      :=  $(call contingent, nodejs node)
NPM         :=  $(call contingent, npm)
PHANTOMJS   :=  $(call contingent, phantomjs)
QRENCODE    :=  $(call contingent, qrencode) --8bit --level=H
RM          :=  $(call contingent, grm rm) -rf
SED         :=  $(call contingent, gsed sed)
SORT        :=  $(call contingent, gsort sort) -u
TRUE        :=  $(call contingent, true)
XARGS       :=  $(call contingent, xargs)
YUICOMP     :=  $(call contingent, yuicompressor)
ZIP         :=  $(call contingent, zip)

USERNAME    :=  $(shell $(call contingent, whoami))

#-  vim:set syntax=make:
