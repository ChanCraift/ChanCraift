(function() {
        var QQ_UIN = "3756644164";
        var WEB_URL = " ";
        var FALLBACK_DELAY = 15000;
        var link = document.getElementById("qq-link");
        var fallbackTimer = null;
        var pageHidden = false;
        function getEnv() {
            var ua = navigator.userAgent.toLowerCase();
            var ua2 = navigator.userAgent;
            var platform = function(os) {
                var ver = ("" + (new RegExp(os + "(\d+((\.|_)\d+)*)").exec(ua) || [,0])[1]).replace(/_/g, ".");
                return !!parseFloat(ver);
            };
            return {
                is_ios: platform("os "),
                is_android: platform("android[/ ]"),
                is_wx: /MicroMessenger\/([\d\.]+)/.test(ua2),
                is_chrome: (ua.match(/chrome\/([\d.]+)/ig) || ua.match(/CriOS\/([\d.]+)/)) ? true : false
            };
        }
        function buildScheme(env) {
            var base = "mqqapi://card/show_pslcard?src_type=internal&version=1&uin=" + QQ_UIN + "&card_type=person&source=qrcode";
            if (env.is_android && env.is_chrome && !env.is_wx) {
                return "intent://card/show_pslcard?src_type=internal&version=1&uin=" + QQ_UIN + "&card_type=person&source=qrcode#Intent;scheme=mqqapi;package=com.tencent.mobileqq;end";
            }
            return base;
        }
        function clearFallback() {
            if (fallbackTimer) {
                clearTimeout(fallbackTimer);
                fallbackTimer = null;
            }
        }
        function scheduleFallback() {
            clearFallback();
            fallbackTimer = setTimeout(function() {
                if (!pageHidden) {
                    window.location.href = WEB_URL;
                }
            }, FALLBACK_DELAY);
        }
        function onVisibilityChange() {
            if (document.hidden || document.webkitHidden) {
                pageHidden = true;
                clearFallback();
            } else {
                pageHidden = false;
            }
        }
        document.addEventListener("visibilitychange", onVisibilityChange);
        document.addEventListener("webkitvisibilitychange", onVisibilityChange);
        window.addEventListener("pagehide", function() {
            pageHidden = true;
            clearFallback();
        });
        window.addEventListener("blur", function() {
            pageHidden = true;
            clearFallback();
        });
        function callQQ(env) {
            var scheme = buildScheme(env);
            if (env.is_wx) {
                if (typeof WeixinJSBridge === "object" && typeof WeixinJSBridge.invoke === "function") {
                    wxCallQQ(scheme);
                } else if (document.addEventListener) {
                    document.addEventListener("WeixinJSBridgeReady", function() {
                        wxCallQQ(scheme);
                    }, false);
                }
                return;
            }
            scheduleFallback();
            if (env.is_android && !env.is_chrome) {
                var iframe = document.createElement("iframe");
                iframe.style.cssText = "display:none;width:0px;height:0px;";
                setTimeout(function() {
                    iframe.src = scheme;
                    document.body.appendChild(iframe);
                }, 500);
            } else {
                window.location.href = scheme;
            }
        }
        function wxCallQQ(url) {
            var callTimestamp = Date.now();
            var isCallbacked = 0;
            scheduleFallback();
            var interval = setInterval(function() {
                var now = Date.now();
                if (isCallbacked) {
                    if (now - callTimestamp > 650) {
                        clearInterval(interval);
                    } else if (isCallbacked > 5) {
                        clearInterval(interval);
                    }
                    callTimestamp = now;
                    isCallbacked++;
                } else {
                    callTimestamp = now;
                }
            }, 500);
            WeixinJSBridge.invoke("launchApplication", {
                "schemeUrl": url
            }, function(res) {
                if ("launchApplication:failed" === res.err_msg) {
                    clearFallback();
                    window.location.href = WEB_URL;
                } else {
                    isCallbacked = 1;
                }
            });
        }
        link.addEventListener("click", function(e) {
            e.preventDefault();
            var env = getEnv();
            callQQ(env);
        });
    })();