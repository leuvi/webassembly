import "./wasm_exec";

const $ = (elem) => document.querySelector(elem);

HTMLElement.prototype.on = function (type, callback) {
  return this.addEventListener(
    type,
    function (e) {
      callback(e);
    },
    !1
  );
};

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const go = new Go();
    let result = await WebAssembly.instantiateStreaming(
      fetch("demo.wasm"),
      go.importObject
    );

    if (result) {
      go.run(result.instance);
      for(let i in window) {
        if(/^go+/.test(i)) {
          console.log(i)
        }
      }
    }
  } catch (error) {
    console.log(error);
  }

  //DOM
  $("#qs").on("click", () => {
    console.log(goQs($("#qsinput").value));
  });

  //计算
  $("#jsadd").on("click", () => {
    $("#addr").innerText = Number($("#add1").value) + Number($("#add2").value);
  });
  $("#goadd").on("click", () => {
    $("#addr").innerText = goAdd(
      Number($("#add1").value),
      Number($("#add2").value)
    );
  });

  $("#fib").on("click", () => {
    //41
    $("#fibr").innerText = goFibonacci(Number($("#fibnum").value));
  });
  $("#lastfib").on("click", () => {
    $("#fibr").innerText = goLastFibonacci(Number($("#fibnum").value));
  });

  //加密
  $("#md5").on("change", function (e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = function () {
      $("#md5text").innerText = goMd5(new Uint8Array(this.result));
    };
  });

  $("#login").on("click", () => {
    $("#aesr").innerText = JSON.stringify({
      usename: $("#username").value,
      password: $("#password").value,
    });
  });
  $("#base64").on("click", () => {
    $("#aesr").innerText = JSON.stringify({
      usename: $("#username").value,
      password: btoa($("#password").value),
    });
  });
  $("#aeslogin").on("click", () => {
    $("#aesr").innerText = JSON.stringify({
      usename: $("#username").value,
      password: goEncrypt($("#password").value),
    });
  });
  $("#decrypt").on("click", () => {
    $("#decryptr").innerText = goDecrypt($("#encryptstr").value);
  });

  //图片处理
  $("#preview").on("change", function (e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = function () {
      const arr = goScale(new Uint8Array(this.result), 100, 100);
      const blob = new Blob([arr], { type: file.type });
      const imgUrl = URL.createObjectURL(blob);
      window.open(imgUrl);
      URL.revokeObjectURL(imgUrl);
    };
  });
  $("#download").on("change", function (e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = function () {
      const arr = goScale(new Uint8Array(this.result), 100, 100);
      const blob = new Blob([arr], { type: file.type });
      const imgUrl = URL.createObjectURL(blob);
      const elem = document.createElement("a");
      elem.href = imgUrl;
      elem.download = file.name;
      elem.click();
      URL.revokeObjectURL(imgUrl);
    };
  });

  //http请求
  $("#http").on("click", () => {
    $("#httptime").innerText = ''
    $("#httpr").innerText = ''
    goHttp($("#httpinput").value);
    setTimeout(() => {
      $("#httptime").innerText = '耗时：' + window.__time + 'ms';
      $("#httpr").innerText = window.__response;
    }, 1000);
  });
});
