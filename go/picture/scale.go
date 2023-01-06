package picture

import (
	"bytes"
	"image"
	"image/jpeg"
	"image/png"
	"log"
	"syscall/js"

	"github.com/nfnt/resize"
)

func ScaleImage(this js.Value, args []js.Value) interface{} {
	dst := make([]byte, args[0].Length())
	js.CopyBytesToGo(dst, args[0])

	//创建图片
	reader := bytes.NewReader(dst)
	img, format, err := image.Decode(reader)
	if err != nil {
		log.Println(err)
		return nil
	}

	log.Println("图片格式:", format)

	scaleImg := resize.Resize(uint(args[1].Int()), uint(args[2].Int()), img, resize.Lanczos3)

	buffer := new(bytes.Buffer)

	if format == "png" {
		err = png.Encode(buffer, scaleImg)
		if err != nil {
			log.Println(err)
			return nil
		}
	} else if format == "jpeg" {
		err = jpeg.Encode(buffer, scaleImg, nil)
		if err != nil {
			log.Println(err)
			return nil
		}
	} else {
		log.Println("不支持的图片格式:", format)
		return nil
	}

	output := buffer.Bytes()
	jsArray := js.Global().Get("Uint8Array").New(len(output))
	js.CopyBytesToJS(jsArray, output)
	return jsArray
}
