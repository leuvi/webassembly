#编译webAssembly需要修改环境变量
export GOOS=js
export GOARCH=wasm

#非编译webAssembly需要改回环境变量
#export GOOS=windows
#export GOARCH=amd64

#编译的时候会提示奇怪的信息尝试设置
#export CGO_ENABLED=0

#使用modules，不去GOPATH目录下查找。
#go env -w GO111MODULE=on
#设置国内镜像
#go env -w GOPROXY=https://goproxy.cn,direct

#恢复初始设置
#go env -u