package main

import (
	"fmt"
	"liuxionghui/compute"
	"liuxionghui/dom"
	"liuxionghui/encrypt"
	"liuxionghui/network"
	"liuxionghui/picture"
	"syscall/js"
)

func main() {
	//go调用js
	fmt.Printf("window.innerWidth = %d \n", dom.InnerWidth())

	js.Global().Set("goQs", js.FuncOf(dom.QuerySelector))
	js.Global().Set("goClip", js.FuncOf(picture.ClipImage))
	js.Global().Set("goFibonacci", js.FuncOf(compute.JsFibonacci))
	js.Global().Set("goLastFibonacci", js.FuncOf(compute.JsLastFibonacci))
	js.Global().Set("goEncrypt", js.FuncOf(encrypt.JsEncrypt))
	js.Global().Set("goDecrypt", js.FuncOf(encrypt.JsDecrypt))
	js.Global().Set("goMd5", js.FuncOf(encrypt.JsMd5))
	js.Global().Set("goAdd", js.FuncOf(compute.JsAdd))
	js.Global().Set("goSubtract", js.FuncOf(compute.JsSubtract))
	js.Global().Set("goScale", js.FuncOf(picture.ScaleImage))
	js.Global().Set("goHttp", js.FuncOf(network.HttpRequest))

	//创建一个无缓冲通道
	done := make(chan int)
	<-done
}
