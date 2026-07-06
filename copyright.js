(function() {
        var yearEl = document.getElementById("year");
        var START_YEAR = 2026;
        function setYear(currentYear) {
            if (currentYear === START_YEAR) {
                yearEl.textContent = START_YEAR;
            } else {
                yearEl.textContent = START_YEAR + "-" + currentYear;
            }
        }
        function fallbackYear() {
            setYear(new Date().getFullYear());
        }
        fetch("https://quan.suning.com/getSysTime.do")
            .then(function(r) { return r.json(); })
            .then(function(data) {
                var serverYear = parseInt(data.sysTime2.slice(0, 4), 10);
                setYear(serverYear);
            })
            .catch(function() {
                return fetch("https://api.m.taobao.com/rest/api3.do?api=mtop.common.getTimestamp")
                    .then(function(r) { return r.json(); })
                    .then(function(data) {
                        var serverYear = new Date(Number(data.data.t)).getFullYear();
                        setYear(serverYear);
                    });
            })
            .catch(fallbackYear);
    })();