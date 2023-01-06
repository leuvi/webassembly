package compute

import (
	"syscall/js"
)

// 递归调用
func Fibonacci(n int) int {
	if n < 2 {
		return n
	}
	return Fibonacci(n-1) + Fibonacci(n-2)
}

// 尾递归
func LastFibonacci(n int, r1 int, r2 int) int {
	if n == 1 {
		return r1
	}
	return LastFibonacci(n-1, r2, r1+r2)
}

func JsFibonacci(this js.Value, args []js.Value) interface{} {
	return Fibonacci(args[0].Int())
}

func JsLastFibonacci(this js.Value, args []js.Value) interface{} {
	return LastFibonacci(args[0].Int(), 1, 1)
}
