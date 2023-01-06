file=demo.wasm
dir=../public

fileDir="$dir/$file"

if test -e $fileDir
then
  rm -r $fileDir
fi

go build -o $file main.go

mv demo.wasm $dir 

if [ $? != 0 ]; then
  exit 1
fi

echo "构建完成：$fileDir"