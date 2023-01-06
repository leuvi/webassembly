package compute

import (
	"syscall/js"

	"github.com/shopspring/decimal"
)

func JsAdd(this js.Value, args []js.Value) interface{} {
	result, _ := decimal.NewFromFloat(args[0].Float()).Add(decimal.NewFromFloat(args[1].Float())).Float64()
	return result
}

func JsSubtract(this js.Value, args []js.Value) interface{} {
	result, _ := decimal.NewFromFloat(args[0].Float()).Sub(decimal.NewFromFloat(args[1].Float())).Float64()
	return result
}
