#!/bin/bash
cd ~
mkdir backend_try
cd backend_try
npm install express
npm install express-generator
git clone https://github.com/andythebreaker/backend_pet.git
cd backend_pet
mkdir ../garbage
mv node_modules ../garbage
rm *.txt
rm package-lock.json
rsync -r . ..
cd ..
search='mongodb://localhost:27017/nodeauth'
replace='mongodb://140.116.132.223:27017/nodeauth'
filename='./models/user.js'
sed -i "s#${search}#${replace}#gi" $filename
# Ask the user for their name
echo enter a port you like:
read varname
search='3000'
filename='./bin/www'
sed -i "s#${search}#${varname}#gi" $filename
npm install
npm start
