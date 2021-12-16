#!/bin/bash

rm file_list.txt
tree -i -f | grep .js$ | sed 's/^\./https:\/\/raw\.githubusercontent\.com\/mikomyazaki\/bitburner\/main/g' >> file_list.txt

git add .
git commit -m "Automated upload."
git push
