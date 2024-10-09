#!/bin/bash

if [ ! -f .env.example ]; then
    echo ".env.example file not found."
    exit 1
fi

if [ -f .env ]; then
    echo ".env already exists, skipping..."
else
    cp .env.example .env

    temp_file=$(mktemp)

    while IFS= read -r line; do
        echo "$line" >> "$temp_file"
    done < .env

    mv "$temp_file" .env

    echo "Created .env"
fi

echo "***Operation finished***"
