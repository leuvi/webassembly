(() => {
      new EventSource("/event.sse").onmessage = (e) => {
        window.location.reload()
      }
    })();
(() => {
  // src/wasm_exec.js
  (() => {
    const enosys = () => {
      const err = new Error("not implemented");
      err.code = "ENOSYS";
      return err;
    };
    if (!globalThis.fs) {
      let outputBuf = "";
      globalThis.fs = {
        constants: { O_WRONLY: -1, O_RDWR: -1, O_CREAT: -1, O_TRUNC: -1, O_APPEND: -1, O_EXCL: -1 },
        writeSync(fd, buf) {
          outputBuf += decoder.decode(buf);
          const nl = outputBuf.lastIndexOf("\n");
          if (nl != -1) {
            console.log(outputBuf.substr(0, nl));
            outputBuf = outputBuf.substr(nl + 1);
          }
          return buf.length;
        },
        write(fd, buf, offset, length, position, callback) {
          if (offset !== 0 || length !== buf.length || position !== null) {
            callback(enosys());
            return;
          }
          const n = this.writeSync(fd, buf);
          callback(null, n);
        },
        chmod(path, mode, callback) {
          callback(enosys());
        },
        chown(path, uid, gid, callback) {
          callback(enosys());
        },
        close(fd, callback) {
          callback(enosys());
        },
        fchmod(fd, mode, callback) {
          callback(enosys());
        },
        fchown(fd, uid, gid, callback) {
          callback(enosys());
        },
        fstat(fd, callback) {
          callback(enosys());
        },
        fsync(fd, callback) {
          callback(null);
        },
        ftruncate(fd, length, callback) {
          callback(enosys());
        },
        lchown(path, uid, gid, callback) {
          callback(enosys());
        },
        link(path, link, callback) {
          callback(enosys());
        },
        lstat(path, callback) {
          callback(enosys());
        },
        mkdir(path, perm, callback) {
          callback(enosys());
        },
        open(path, flags, mode, callback) {
          callback(enosys());
        },
        read(fd, buffer, offset, length, position, callback) {
          callback(enosys());
        },
        readdir(path, callback) {
          callback(enosys());
        },
        readlink(path, callback) {
          callback(enosys());
        },
        rename(from, to, callback) {
          callback(enosys());
        },
        rmdir(path, callback) {
          callback(enosys());
        },
        stat(path, callback) {
          callback(enosys());
        },
        symlink(path, link, callback) {
          callback(enosys());
        },
        truncate(path, length, callback) {
          callback(enosys());
        },
        unlink(path, callback) {
          callback(enosys());
        },
        utimes(path, atime, mtime, callback) {
          callback(enosys());
        }
      };
    }
    if (!globalThis.process) {
      globalThis.process = {
        getuid() {
          return -1;
        },
        getgid() {
          return -1;
        },
        geteuid() {
          return -1;
        },
        getegid() {
          return -1;
        },
        getgroups() {
          throw enosys();
        },
        pid: -1,
        ppid: -1,
        umask() {
          throw enosys();
        },
        cwd() {
          throw enosys();
        },
        chdir() {
          throw enosys();
        }
      };
    }
    if (!globalThis.crypto) {
      throw new Error("globalThis.crypto is not available, polyfill required (crypto.getRandomValues only)");
    }
    if (!globalThis.performance) {
      throw new Error("globalThis.performance is not available, polyfill required (performance.now only)");
    }
    if (!globalThis.TextEncoder) {
      throw new Error("globalThis.TextEncoder is not available, polyfill required");
    }
    if (!globalThis.TextDecoder) {
      throw new Error("globalThis.TextDecoder is not available, polyfill required");
    }
    const encoder = new TextEncoder("utf-8");
    const decoder = new TextDecoder("utf-8");
    globalThis.Go = class {
      constructor() {
        this.argv = ["js"];
        this.env = {};
        this.exit = (code) => {
          if (code !== 0) {
            console.warn("exit code:", code);
          }
        };
        this._exitPromise = new Promise((resolve) => {
          this._resolveExitPromise = resolve;
        });
        this._pendingEvent = null;
        this._scheduledTimeouts = /* @__PURE__ */ new Map();
        this._nextCallbackTimeoutID = 1;
        const setInt64 = (addr, v) => {
          this.mem.setUint32(addr + 0, v, true);
          this.mem.setUint32(addr + 4, Math.floor(v / 4294967296), true);
        };
        const getInt64 = (addr) => {
          const low = this.mem.getUint32(addr + 0, true);
          const high = this.mem.getInt32(addr + 4, true);
          return low + high * 4294967296;
        };
        const loadValue = (addr) => {
          const f = this.mem.getFloat64(addr, true);
          if (f === 0) {
            return void 0;
          }
          if (!isNaN(f)) {
            return f;
          }
          const id = this.mem.getUint32(addr, true);
          return this._values[id];
        };
        const storeValue = (addr, v) => {
          const nanHead = 2146959360;
          if (typeof v === "number" && v !== 0) {
            if (isNaN(v)) {
              this.mem.setUint32(addr + 4, nanHead, true);
              this.mem.setUint32(addr, 0, true);
              return;
            }
            this.mem.setFloat64(addr, v, true);
            return;
          }
          if (v === void 0) {
            this.mem.setFloat64(addr, 0, true);
            return;
          }
          let id = this._ids.get(v);
          if (id === void 0) {
            id = this._idPool.pop();
            if (id === void 0) {
              id = this._values.length;
            }
            this._values[id] = v;
            this._goRefCounts[id] = 0;
            this._ids.set(v, id);
          }
          this._goRefCounts[id]++;
          let typeFlag = 0;
          switch (typeof v) {
            case "object":
              if (v !== null) {
                typeFlag = 1;
              }
              break;
            case "string":
              typeFlag = 2;
              break;
            case "symbol":
              typeFlag = 3;
              break;
            case "function":
              typeFlag = 4;
              break;
          }
          this.mem.setUint32(addr + 4, nanHead | typeFlag, true);
          this.mem.setUint32(addr, id, true);
        };
        const loadSlice = (addr) => {
          const array = getInt64(addr + 0);
          const len = getInt64(addr + 8);
          return new Uint8Array(this._inst.exports.mem.buffer, array, len);
        };
        const loadSliceOfValues = (addr) => {
          const array = getInt64(addr + 0);
          const len = getInt64(addr + 8);
          const a = new Array(len);
          for (let i = 0; i < len; i++) {
            a[i] = loadValue(array + i * 8);
          }
          return a;
        };
        const loadString = (addr) => {
          const saddr = getInt64(addr + 0);
          const len = getInt64(addr + 8);
          return decoder.decode(new DataView(this._inst.exports.mem.buffer, saddr, len));
        };
        const timeOrigin = Date.now() - performance.now();
        this.importObject = {
          go: {
            "runtime.wasmExit": (sp) => {
              sp >>>= 0;
              const code = this.mem.getInt32(sp + 8, true);
              this.exited = true;
              delete this._inst;
              delete this._values;
              delete this._goRefCounts;
              delete this._ids;
              delete this._idPool;
              this.exit(code);
            },
            "runtime.wasmWrite": (sp) => {
              sp >>>= 0;
              const fd = getInt64(sp + 8);
              const p = getInt64(sp + 16);
              const n = this.mem.getInt32(sp + 24, true);
              fs.writeSync(fd, new Uint8Array(this._inst.exports.mem.buffer, p, n));
            },
            "runtime.resetMemoryDataView": (sp) => {
              sp >>>= 0;
              this.mem = new DataView(this._inst.exports.mem.buffer);
            },
            "runtime.nanotime1": (sp) => {
              sp >>>= 0;
              setInt64(sp + 8, (timeOrigin + performance.now()) * 1e6);
            },
            "runtime.walltime": (sp) => {
              sp >>>= 0;
              const msec = new Date().getTime();
              setInt64(sp + 8, msec / 1e3);
              this.mem.setInt32(sp + 16, msec % 1e3 * 1e6, true);
            },
            "runtime.scheduleTimeoutEvent": (sp) => {
              sp >>>= 0;
              const id = this._nextCallbackTimeoutID;
              this._nextCallbackTimeoutID++;
              this._scheduledTimeouts.set(id, setTimeout(
                () => {
                  this._resume();
                  while (this._scheduledTimeouts.has(id)) {
                    console.warn("scheduleTimeoutEvent: missed timeout event");
                    this._resume();
                  }
                },
                getInt64(sp + 8) + 1
              ));
              this.mem.setInt32(sp + 16, id, true);
            },
            "runtime.clearTimeoutEvent": (sp) => {
              sp >>>= 0;
              const id = this.mem.getInt32(sp + 8, true);
              clearTimeout(this._scheduledTimeouts.get(id));
              this._scheduledTimeouts.delete(id);
            },
            "runtime.getRandomData": (sp) => {
              sp >>>= 0;
              crypto.getRandomValues(loadSlice(sp + 8));
            },
            "syscall/js.finalizeRef": (sp) => {
              sp >>>= 0;
              const id = this.mem.getUint32(sp + 8, true);
              this._goRefCounts[id]--;
              if (this._goRefCounts[id] === 0) {
                const v = this._values[id];
                this._values[id] = null;
                this._ids.delete(v);
                this._idPool.push(id);
              }
            },
            "syscall/js.stringVal": (sp) => {
              sp >>>= 0;
              storeValue(sp + 24, loadString(sp + 8));
            },
            "syscall/js.valueGet": (sp) => {
              sp >>>= 0;
              const result = Reflect.get(loadValue(sp + 8), loadString(sp + 16));
              sp = this._inst.exports.getsp() >>> 0;
              storeValue(sp + 32, result);
            },
            "syscall/js.valueSet": (sp) => {
              sp >>>= 0;
              Reflect.set(loadValue(sp + 8), loadString(sp + 16), loadValue(sp + 32));
            },
            "syscall/js.valueDelete": (sp) => {
              sp >>>= 0;
              Reflect.deleteProperty(loadValue(sp + 8), loadString(sp + 16));
            },
            "syscall/js.valueIndex": (sp) => {
              sp >>>= 0;
              storeValue(sp + 24, Reflect.get(loadValue(sp + 8), getInt64(sp + 16)));
            },
            "syscall/js.valueSetIndex": (sp) => {
              sp >>>= 0;
              Reflect.set(loadValue(sp + 8), getInt64(sp + 16), loadValue(sp + 24));
            },
            "syscall/js.valueCall": (sp) => {
              sp >>>= 0;
              try {
                const v = loadValue(sp + 8);
                const m = Reflect.get(v, loadString(sp + 16));
                const args = loadSliceOfValues(sp + 32);
                const result = Reflect.apply(m, v, args);
                sp = this._inst.exports.getsp() >>> 0;
                storeValue(sp + 56, result);
                this.mem.setUint8(sp + 64, 1);
              } catch (err) {
                sp = this._inst.exports.getsp() >>> 0;
                storeValue(sp + 56, err);
                this.mem.setUint8(sp + 64, 0);
              }
            },
            "syscall/js.valueInvoke": (sp) => {
              sp >>>= 0;
              try {
                const v = loadValue(sp + 8);
                const args = loadSliceOfValues(sp + 16);
                const result = Reflect.apply(v, void 0, args);
                sp = this._inst.exports.getsp() >>> 0;
                storeValue(sp + 40, result);
                this.mem.setUint8(sp + 48, 1);
              } catch (err) {
                sp = this._inst.exports.getsp() >>> 0;
                storeValue(sp + 40, err);
                this.mem.setUint8(sp + 48, 0);
              }
            },
            "syscall/js.valueNew": (sp) => {
              sp >>>= 0;
              try {
                const v = loadValue(sp + 8);
                const args = loadSliceOfValues(sp + 16);
                const result = Reflect.construct(v, args);
                sp = this._inst.exports.getsp() >>> 0;
                storeValue(sp + 40, result);
                this.mem.setUint8(sp + 48, 1);
              } catch (err) {
                sp = this._inst.exports.getsp() >>> 0;
                storeValue(sp + 40, err);
                this.mem.setUint8(sp + 48, 0);
              }
            },
            "syscall/js.valueLength": (sp) => {
              sp >>>= 0;
              setInt64(sp + 16, parseInt(loadValue(sp + 8).length));
            },
            "syscall/js.valuePrepareString": (sp) => {
              sp >>>= 0;
              const str = encoder.encode(String(loadValue(sp + 8)));
              storeValue(sp + 16, str);
              setInt64(sp + 24, str.length);
            },
            "syscall/js.valueLoadString": (sp) => {
              sp >>>= 0;
              const str = loadValue(sp + 8);
              loadSlice(sp + 16).set(str);
            },
            "syscall/js.valueInstanceOf": (sp) => {
              sp >>>= 0;
              this.mem.setUint8(sp + 24, loadValue(sp + 8) instanceof loadValue(sp + 16) ? 1 : 0);
            },
            "syscall/js.copyBytesToGo": (sp) => {
              sp >>>= 0;
              const dst = loadSlice(sp + 8);
              const src = loadValue(sp + 32);
              if (!(src instanceof Uint8Array || src instanceof Uint8ClampedArray)) {
                this.mem.setUint8(sp + 48, 0);
                return;
              }
              const toCopy = src.subarray(0, dst.length);
              dst.set(toCopy);
              setInt64(sp + 40, toCopy.length);
              this.mem.setUint8(sp + 48, 1);
            },
            "syscall/js.copyBytesToJS": (sp) => {
              sp >>>= 0;
              const dst = loadValue(sp + 8);
              const src = loadSlice(sp + 16);
              if (!(dst instanceof Uint8Array || dst instanceof Uint8ClampedArray)) {
                this.mem.setUint8(sp + 48, 0);
                return;
              }
              const toCopy = src.subarray(0, dst.length);
              dst.set(toCopy);
              setInt64(sp + 40, toCopy.length);
              this.mem.setUint8(sp + 48, 1);
            },
            "debug": (value) => {
              console.log(value);
            }
          }
        };
      }
      async run(instance) {
        if (!(instance instanceof WebAssembly.Instance)) {
          throw new Error("Go.run: WebAssembly.Instance expected");
        }
        this._inst = instance;
        this.mem = new DataView(this._inst.exports.mem.buffer);
        this._values = [
          NaN,
          0,
          null,
          true,
          false,
          globalThis,
          this
        ];
        this._goRefCounts = new Array(this._values.length).fill(Infinity);
        this._ids = /* @__PURE__ */ new Map([
          [0, 1],
          [null, 2],
          [true, 3],
          [false, 4],
          [globalThis, 5],
          [this, 6]
        ]);
        this._idPool = [];
        this.exited = false;
        let offset = 4096;
        const strPtr = (str) => {
          const ptr = offset;
          const bytes = encoder.encode(str + "\0");
          new Uint8Array(this.mem.buffer, offset, bytes.length).set(bytes);
          offset += bytes.length;
          if (offset % 8 !== 0) {
            offset += 8 - offset % 8;
          }
          return ptr;
        };
        const argc = this.argv.length;
        const argvPtrs = [];
        this.argv.forEach((arg) => {
          argvPtrs.push(strPtr(arg));
        });
        argvPtrs.push(0);
        const keys = Object.keys(this.env).sort();
        keys.forEach((key) => {
          argvPtrs.push(strPtr(`${key}=${this.env[key]}`));
        });
        argvPtrs.push(0);
        const argv = offset;
        argvPtrs.forEach((ptr) => {
          this.mem.setUint32(offset, ptr, true);
          this.mem.setUint32(offset + 4, 0, true);
          offset += 8;
        });
        const wasmMinDataAddr = 4096 + 8192;
        if (offset >= wasmMinDataAddr) {
          throw new Error("total length of command line and environment variables exceeds limit");
        }
        this._inst.exports.run(argc, argv);
        if (this.exited) {
          this._resolveExitPromise();
        }
        await this._exitPromise;
      }
      _resume() {
        if (this.exited) {
          throw new Error("Go program has already exited");
        }
        this._inst.exports.resume();
        if (this.exited) {
          this._resolveExitPromise();
        }
      }
      _makeFuncWrapper(id) {
        const go = this;
        return function() {
          const event = { id, this: this, args: arguments };
          go._pendingEvent = event;
          go._resume();
          return event.result;
        };
      }
    };
  })();

  // src/index.js
  var $ = (elem) => document.querySelector(elem);
  HTMLElement.prototype.on = function(type, callback) {
    return this.addEventListener(
      type,
      function(e) {
        callback(e);
      },
      false
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
        for (let i in window) {
          if (/^go+/.test(i)) {
            console.log(i);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
    $("#qs").on("click", () => {
      console.log(goQs($("#qsinput").value));
    });
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
      $("#fibr").innerText = goFibonacci(Number($("#fibnum").value));
    });
    $("#lastfib").on("click", () => {
      $("#fibr").innerText = goLastFibonacci(Number($("#fibnum").value));
    });
    $("#md5").on("change", function(e) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = function() {
        $("#md5text").innerText = goMd5(new Uint8Array(this.result));
      };
    });
    $("#login").on("click", () => {
      $("#aesr").innerText = JSON.stringify({
        usename: $("#username").value,
        password: $("#password").value
      });
    });
    $("#base64").on("click", () => {
      $("#aesr").innerText = JSON.stringify({
        usename: $("#username").value,
        password: btoa($("#password").value)
      });
    });
    $("#aeslogin").on("click", () => {
      $("#aesr").innerText = JSON.stringify({
        usename: $("#username").value,
        password: goEncrypt($("#password").value)
      });
    });
    $("#decrypt").on("click", () => {
      $("#decryptr").innerText = goDecrypt($("#encryptstr").value);
    });
    $("#preview").on("change", function(e) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = function() {
        const arr = goScale(new Uint8Array(this.result), 100, 100);
        const blob = new Blob([arr], { type: file.type });
        const imgUrl = URL.createObjectURL(blob);
        window.open(imgUrl);
        URL.revokeObjectURL(imgUrl);
      };
    });
    $("#download").on("change", function(e) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = function() {
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
    $("#http").on("click", () => {
      $("#httptime").innerText = "";
      $("#httpr").innerText = "";
      goHttp($("#httpinput").value);
      setTimeout(() => {
        $("#httptime").innerText = "\u8017\u65F6\uFF1A" + window.__time + "ms";
        $("#httpr").innerText = window.__response;
      }, 1e3);
    });
  });
})();
