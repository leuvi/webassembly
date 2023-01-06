package encrypt

import (
	"crypto/md5"
	"fmt"
	"syscall/js"
)

func JsMd5(this js.Value, args []js.Value) interface{} {
	buffer := make([]byte, args[0].Length())
	js.CopyBytesToGo(buffer, args[0])
	return fmt.Sprintf("%X", md5.Sum(buffer))
}
