if [ -e ./node_modules ]; then
  npm i
fi
npx tsc 
node ./dist/index.js