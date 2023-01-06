package encrypt

import (
	"bytes"
	"crypto/aes"
	"crypto/cipher"
	"encoding/hex"
	"syscall/js"
)

const (
	KEY = "liuxionghui12345" //密钥
	IV  = "ludashi123456789" //初始化向量
)

// 加密
func Aes_Encrypt(str string) string {
	src := []byte(str)
	block, err := aes.NewCipher([]byte(KEY))
	if err != nil {
		panic(err)
	}
	src = paddingBytes(src, block.BlockSize())
	cbcDecrypter := cipher.NewCBCEncrypter(block, []byte(IV))
	dst := make([]byte, len(src))
	cbcDecrypter.CryptBlocks(dst, src)
	return hex.EncodeToString(dst)
}

// 解密
func Aes_Decrypt(str string) string {
	src, _ := hex.DecodeString(str)
	block, err := aes.NewCipher([]byte(KEY))
	if err != nil {
		panic(err)
	}
	cbcDecrypter := cipher.NewCBCDecrypter(block, []byte(IV))
	dst := make([]byte, len(src))
	cbcDecrypter.CryptBlocks(dst, src)
	newBytes := unPaddingBytes(dst)
	return string(newBytes)
}

// 填充
func paddingBytes(src []byte, blockSize int) []byte {
	padding := blockSize - len(src)%blockSize
	padBytes := bytes.Repeat([]byte{byte(padding)}, padding)
	newBytes := append(src, padBytes...)
	return newBytes
}

// 删除填充
func unPaddingBytes(src []byte) []byte {
	l := len(src)
	n := int(src[l-1])
	return src[:l-n]
}

// 转为js调用
func JsEncrypt(this js.Value, args []js.Value) interface{} {
	return Aes_Encrypt(args[0].String())
}
func JsDecrypt(this js.Value, args []js.Value) interface{} {
	return Aes_Decrypt(args[0].String())
}
