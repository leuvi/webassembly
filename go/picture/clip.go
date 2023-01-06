package picture

import (
	"fmt"
	"syscall/js"
)

func ClipImage(this js.Value, args []js.Value) interface{} {
	dst := make([]byte, args[0].Length())
	js.CopyBytesToGo(dst, args[0])

	out := string(dst)
	fmt.Println(dst)
	return out
}
