while true
	do
	# node_modules check
	if [ -e ./node_modules ]; then
		npm i
	fi
	
	npm start
	sleep 1
done