package network

import (
	//"fmt"
	"io"
	"log"
	"net/http"
	"syscall/js"
	"time"
)

func HttpRequest(this js.Value, arg []js.Value) interface{} {
	go func() {
		start := time.Now().UnixMilli()
		req, err := http.NewRequest("GET", arg[0].String(), nil)
		if err != nil {
			log.Fatalln(err)
		}

		req.Header.Set("Accept", "application/json")

		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil {
			log.Fatalln(err)
		}

		defer resp.Body.Close()

		b, err := io.ReadAll(resp.Body)
		if err != nil {
			log.Fatalln(err)
		}

		//fmt.Println(string(b))
		js.Global().Get("window").Set("__response", string(b))
		js.Global().Get("window").Set("__time", time.Now().UnixMilli()-start)
	}()
	return nil
}
