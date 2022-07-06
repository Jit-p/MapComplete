#! /usr/bin/env bash

echo "Starting build"
# The build script; we build the application step by step as building everything at once takes too much RAM
# Should be run from the repository root
# This is the main deployment script
rm -rf dist/*
rm -rf .cache
mkdir dist 2> /dev/null
mkdir dist/assets 2> /dev/null

# This script ends every line with '&&' to chain everything. A failure will thus stop the build
npm run generate:editor-layer-index 
npm run generate &&
ts-node ./scripts/generateLayeroverview --force && # generate:layeroverview has to be run twice: the personal theme won't pick up all the layers otherwise
npm run test &&
npm run generate:layouts 

if [ $? -ne 0 ]; then
    echo "ERROR - stopping the build"
    exit 1
fi

# Copy the layer files, as these might contain assets (e.g. svgs)
cp -r assets/layers/ dist/assets/layers/
cp -r assets/themes/ dist/assets/themes/
cp -r assets/svg/ dist/assets/svg/
cp -r assets/tagRenderings/ dist/assets/tagRenderings/
cp assets/*.png dist/assets/
cp assets/*.svg dist/assets/
cp assets/generated/*.png dist/assets/generated/
cp assets/generated/*.svg dist/assets/generated/

SRC_MAPS="--no-source-maps"
BRANCH=`git rev-parse --abbrev-ref HEAD`
echo "The branch name is $BRANCH"
if [ $BRANCH = "develop" ]
then
    SRC_MAPS=""
    echo "Source maps are enabled"
fi

echo -e "\n\n   Building non-theme pages"
echo -e "  ==========================\n\n"
parcel build --public-url "./" $SRC_MAPS "index.html" "404.html" "professional.html" "automaton.html" "import_helper.html" "import_viewer.html" "land.html" "customGenerator.html" "theme.html" vendor
if [ $? -ne 0 ]; then
    echo "ERROR - stopping the build"
    exit 1
fi
echo -e "\n\n   Building theme pages"
echo -e "  ======================\n\n"

for file in index_*.ts
do
    theme=${file:6:-3}
    echo -e "\n\n  $theme"
    echo -e " ------------ \n\n"
    # Builds the necessary files for just one theme, e.g. 'bookcases.html' + 'index_bookcases.ts' + supporting file
    parcel build --public-url './' $SRC_MAPS "$theme.html"
    if [ $? -ne 0 ]; then
        echo "ERROR - stopping the build"
        exit 1
    fi
done
