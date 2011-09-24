prod:

	java -jar lib/google-compiler/compiler-20100616.jar --js src/md5.js --js src/showme.init.js --js src/showme.form.js --js src/showme.load.js --js src/showme.onload.js --js src/showme.extents.js --js src/showme.properties.js --js src/showme.documents.js --js src/showme.clipboard.js > www/showme.min.js

	cp src/showme.css www/showme.css

clean:
	rm www/showme.css
	rm www/showme.min.js