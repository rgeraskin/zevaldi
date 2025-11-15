#!/usr/bin/env bash

# Install Zevaldi

if [ "$(uname)" == "Darwin" ]; then
    echo "MacOs"
    # Copy the files to the Vivaldi app bundle
    cp -r ui/* "/Applications/Vivaldi.app/Contents/Frameworks/Vivaldi Framework.framework/Versions/Current/Resources/vivaldi"
    echo
    echo "Restart Vivaldi!"
else
    echo "Non-MacOs platform are not supported. Because I don't know where Vivaldi keeps its files on other platforms =)"
fi
