#!/bin/bash

rm file_list.txt
tree -i -f | grep .js$ | sed 's/^\./https:\/\/raw\.githubusercontent\.com\/mikomyazaki\/bitburner\/main/g'