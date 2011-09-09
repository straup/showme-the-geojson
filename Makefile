js:

	java -jar lib/google-compiler/compiler-20100616.jar --js www/md5.js --js www/showme.init.js --js www/showme.form.js --js www/showme.load.js --js www/showme.onload.js --js www/showme.extents.js --js www/showme.properties.js --js www/showme.documents.js --js www/showme.clipboard.js > www/showme.min.js

clean:
	rm www/showme.min.js