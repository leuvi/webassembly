package dom

import (
	"syscall/js"
)

func QuerySelector(this js.Value, args []js.Value) interface{} {
	return js.ValueOf(js.Global().Get("document").Call("querySelector", args[0]))
}

func InnerWidth() int {
	return js.Global().Get("innerWidth").Int()
}
