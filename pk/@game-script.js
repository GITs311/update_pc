
function pankouGame(_pkObj, ctr_game, _gameConfig) {
    var _instance = new Object();
    _instance.pk_id = _pkObj.pk_id;
    _instance.game_id = _gameConfig.id;
    _instance.pkObj = _pkObj;
    _instance.ctr_game = ctr_game;
    _instance.gameConfig = _gameConfig;
    _instance.IssueObj = {};
    _instance.FaCtrlOptionEl = '';
    _instance.pagination = null;

    _instance.listTimes = [];
    _instance.daojishi_get = 0;
    _instance.Bet_P = 1;
    _instance.isScrollTimeId = 0;
    _instance.isScroll = false;
    _instance.isPageEnd = false;
    _instance.currentPage = 1;

    _instance.gameDaojishi = function () {
        try {
            if (_instance.IssueObj.hasOwnProperty('qh')) {
                $("#game_qh" + _instance.ctr_game).text(_instance.IssueObj.qh);
                if (_instance.IssueObj.fptime != "" && Number(_instance.IssueObj.fptime) > 0) {
                    _instance.IssueObj.fptime = Number(_instance.IssueObj.fptime) - 1;
                    if (_instance.IssueObj.fptime <= 0) {
                        _instance.IssueObj.fptime = 0;
                    }
                }
                if (_instance.IssueObj.kjtime != "" && Number(_instance.IssueObj.kjtime) > 0) {
                    _instance.IssueObj.kjtime = Number(_instance.IssueObj.kjtime) - 1;
                    if (_instance.IssueObj.kjtime <= 0) {
                        _instance.IssueObj.kjtime = 0;
                    }
                }
                $("#game_fptime" + _instance.ctr_game).text(_instance.IssueObj.fptime);
                $("#game_kjtime" + _instance.ctr_game).text(_instance.IssueObj.kjtime);
            } else {
                console.log('daojishi->null');
            }
            _instance.daojishi_get++;

            if (_instance.daojishi_get >= 1000) {
                _instance.daojishi_get = 0;
            }

        } catch (e) {
            console.error(e);
        }
    }

    _instance.LoadLottery = function () {
        var _is = $('#current_lot_issue' + _instance.ctr_game).val();
        GetApi("api/pk/l_lot?pk_id=" + _instance.pk_id + "&game=" + _instance.game_id + "&issue=" + _is, null, function (res) {
            if (res && res.ret == 200) {
                $('#current_lot_issue' + _instance.ctr_game).val(res.msg);
                var tb_lottery_tr_item = $('#tb_lottery_tr_item' + _instance.ctr_game);

                var tb_lottery_tr_item_str = '';
                for (var i = 0; i < res.data.length; i++) {
                    var row = res.data[i];

                    tb_lottery_tr_item_str += '<tr class="bgc-h-pink-l3">';
                    tb_lottery_tr_item_str += '<td>' + row.timer + '</td>';
                    tb_lottery_tr_item_str += '<td>' + row.issue + '</td>';

                    var codeArray = row.code.split(',');
                    for (var c = 0; c < codeArray.length; c++) {
                        var cstr = codeArray[c];

                        var ccc = '';
                        switch (cstr) {

                            case '1': ccc = 'bgc-warning px-2'; break;
                            case '2': ccc = 'bgc-primary px-2'; break;
                            case '3': ccc = 'bgc-black px-2'; break;
                            case '4': ccc = 'bgc-orange px-2'; break;
                            case '5': ccc = 'bgc-info px-2'; break;
                            case '6': ccc = 'bgc-purple px-2'; break;
                            case '7': ccc = 'bgc-grey px-2'; break;
                            case '8': ccc = 'bgc-red px-2'; break;
                            case '9': ccc = 'bgc-brown px-2'; break;
                            case '10': ccc = 'bgc-green px-1'; break;
                        }
                        //

                        if (_instance.gameConfig.group == 'ssc') {
                            tb_lottery_tr_item_str += '<td> <span class="border-2 bgc-white-tp1  brc-blue-tp1 px-2 radius-4 text-dark font-bold py-1px ">' + cstr + '</span></td>';
                        } else {
                            tb_lottery_tr_item_str += '<td> <span class="border-1 radius-1 ' + ccc + '  text-white font-bold">' + cstr + '</span></td>';
                        }
                    }

                    tb_lottery_tr_item_str += '</tr>';
                }

                tb_lottery_tr_item.html(tb_lottery_tr_item_str);



                var _parent = $('#tb_lottery_scroll' + _instance.ctr_game);


                setTimeout(function () {
                    var trObj = tb_lottery_tr_item.find('tr').first();

                    trObj.addClass('bgc-pink-m2');

                    try {
                        var h = _parent[0].scrollHeight;
                        if (h != undefined) {
                            _parent.scrollTop(0);
                        }
                    } catch (e) {
                        console.error(e);
                    }
                    setTimeout(function () { trObj.removeClass('bgc-pink-m2'); }, 4500);
                }, 3000);

                //res.data
            }
        });
    }

    _instance.getBetRecordTr = function (row, current, visOdds) {

        var tr_item_str = [];
        tr_item_str.push('<tr class="bgc-h-pink-l3" name="' + current + '">');
        tr_item_str.push('<td>' + row.qh + '</td>');
        tr_item_str.push('<td>' + row.name + '</td>');
        tr_item_str.push('<td class="text-center">' + row.m + '</td>');
        tr_item_str.push('<td>' + row.c + '</td>');
        //if (!visOdds) {

        //}
        var ssss = "display:block";
        if (visOdds) {
            ssss = "display:none";
        }
        tr_item_str.push('<td name="pk-odds-vis-' + _instance.ctr_game + '" style="' + ssss + '">' + row.odds + '</td>');
        var statusText = _instance.formatterBetsState(row.state);

        tr_item_str.push('<td>' + statusText + '</td>');


        var bz = '';
        var win_c = '';
        if (row.kj) {
            var win = row.win;
            bz = win > 0 ? "中奖" + win.toFixed(2) + "元" : "不中" + Math.abs(win.toFixed(2)) + "元";
            if (win < 0) {
                win_c = ' class="text-primary-d2"';
            } else {
                win_c = ' class="text-pink-d2"';
            }
        }
        else {
            bz = "";
        }

        var lunci = '第' + (Number(row.zhuma) + 1) + '轮';

        tr_item_str.push('<td>' + row.kj + '</td>');
        tr_item_str.push('<td' + win_c + '>' + bz + '</td>');

        if (_instance.softwareType != 0) {
            tr_item_str.push('<td class="text-center">' + lunci + '</td>');
        }

        tr_item_str.push('</tr>');

        return tr_item_str.join('');
    };

    _instance.Clear = function () {
        var _control = $('#tb_bet_tr_item' + _instance.ctr_game);
        _control.html('');
    }
    _instance.visOddsTd = function (visOdds) {
        try {

            var _control = $('#tb_bet_tr_item' + _instance.ctr_game);
            if (visOdds) {
                $('#vis_odds' + _instance.ctr_game).hide();
                //pk-odds-vis-
                _control.find('td[name="pk-odds-vis-' + _instance.ctr_game + '"]').hide();

            } else {
                $('#vis_odds' + _instance.ctr_game).show();
                _control.find('td[name="pk-odds-vis-' + _instance.ctr_game + '"]').show();
            }
        } catch (e) {

        }
    }
    _instance.LoadBet = function (dataFlag, id, htmlCall) {
        if (!id) {
            id = '';
        }
        var page = _instance.currentPage;
        if (dataFlag == "current") {
            page = 1;
        }
        var url = "api/pk/l_bet?pk_id=" + _instance.pk_id + "&gameType=" + _instance.game_id + "&p=" + page + '&id=' + id;
        GetApi(url, null, function (res) {
            var _control = $('#tb_bet_tr_item' + _instance.ctr_game);

            var visOdds = $('#game_vis_odds' + _instance.ctr_game).prop('checked');
            _instance.visOddsTd(visOdds);

            if (res && res.ret == 200) {
                if (page >= res.page) {
                    _instance.isPageEnd = true;
                } else {
                    if (dataFlag == "more") {
                        _instance.isPageEnd = false;
                    }
                }
                if (res.msg.length > 30 && dataFlag == "current") {
                    $("#current_bets_id" + _instance.ctr_game).val(res.msg);
                }

                var rows = res.rows;
                var length = rows.length;

                if (dataFlag == "more") {
                    for (var i = 0; i < length; i++) {
                        var row = res.rows[i];
                        var item = _instance.getBetRecordTr(row, dataFlag, visOdds);
                        _control.prepend(item);
                    }

                } else {
                    _instance.playCount = 0;

                    if (length > 0) {
                        _control.children("tr[name='" + dataFlag + "']").remove();
                    }
                    for (var i = length - 1; i >= 0; i--) {
                        var row = res.rows[i];
                        var item = _instance.getBetRecordTr(row, dataFlag, visOdds);
                        _control.append(item);
                        _instance.playCount++;
                    }
                }
            }
            if (_instance.betMusicInterval != 0) {
                window.clearInterval(_instance.betMusicInterval);
            }
            _instance.betMusicInterval = window.setInterval(function () {
                if (_instance.playCount == 0) {
                    window.clearInterval(_instance.betMusicInterval);
                    return;
                }
                setTimeout(function () { PlayMusic('dingdong.wav'); }, 10);
            }, 600);

            if (htmlCall) {
                htmlCall(length);
            }
        });
    }
    _instance.playCount = 0;
    _instance.betMusicInterval = null;
    _instance.LoadCurrentBets = function () {

        var id = $("#current_bets_id" + _instance.ctr_game).val();
        _instance.LoadBet('current', id, function (length) {
            if (length <= 0) {
                return;
            }
            var _control = $('#tb_bet_tr_item' + _instance.ctr_game);

            var lastTr = _control.find('tr[name="current"]').last();

            lastTr.addClass('bgc-pink-m2');

            setTimeout(function () {
                lastTr.removeClass('bgc-pink-m2');
            }, 6000);

            try {
                var _parent = $('#tb_bet_scroll' + _instance.ctr_game);
                _parent.scrollTop(_parent.get(0).scrollHeight);
            } catch (e) {

            }

        });
    }

    _instance.bindEditChanged = function () {
        $('#game_switch' + _instance.ctr_game).change(function () {
            var text = $(this).prop('checked');
            var t2 = 1;

            if (text) {
                t2 = 2;
                PlayMusic('sw_ok.wav');
            } else {
                PlayMusic('sw_fail.wav');
            }
            _instance.WriteConfig(
                Constants.memberChanged.game_switch,
                _instance.game_id,
                t2,
                '',
                text);
        });
        $('#game_moni' + _instance.ctr_game).change(function () {
            var text = $(this).prop('checked');
            _instance.WriteConfig(
                Constants.memberChanged.game_analog_flag,
                _instance.game_id,
                0,
                '',
                text);
        });
        $('#game_vis_odds' + _instance.ctr_game).change(function () {
            var text = $(this).prop('checked');
            _instance.WriteConfig(
                Constants.memberChanged.game_vis_odds,
                _instance.game_id,
                0,
                '',
                text);

            _instance.visOddsTd(text);

        });
        $('#game_st_stop_add' + _instance.ctr_game).change(function () {
            var text = $(this).prop('checked');
            _instance.WriteConfig(
                Constants.memberChanged.game_stopnew_gam,
                _instance.game_id,
                0,
                '',
                text);
        });


        $('#game_st_time_start_flag' + _instance.ctr_game).change(function () {
            var text = $(this).prop('checked');
            _instance.WriteConfig(
                Constants.memberChanged.game_auto_start_flag,
                _instance.game_id,
                0,
                '',
                text);
        });
        $('#game_st_time_stop_falg' + _instance.ctr_game).change(function () {
            var text = $(this).prop('checked');
            _instance.WriteConfig(
                Constants.memberChanged.game_auto_stop_flag,
                _instance.game_id,
                0,
                '',
                text);
        });
    }

    _instance.WriteConfig = function (memberChangedType, game, p0, p1, p2, callBack = null) {
        var __request = "api/pk/changed_config?pk_id=" + _instance.pk_id + "&memberChangedType=" + memberChangedType + "&game=" + game + "&p0=" + p0 + "&p1=" + p1 + "&p2=" + p2.toString().toLowerCase();
        GetApi(__request, null, function (res) {
            if (callBack != null) {
                callBack(res.ret == 200);
            }
            if (res.ret != 200) {
                var row = { memberChangedType: memberChangedType, game: game, p0: p0, p1: p1, p2: p2 };
                listErrors.push(row);
                console.error('===========_instance.WriteConfigError===========');
                console.error(row);
                AlertError('上传失败:' + memberChangedType);
            }
        });
    }

    _instance.formatterBetsState = function (state) {
        switch (state) {

            case 2:
                statusText = '成功下注';
                break;
            case 3:
                statusText = '合并';
                break;
            case 4:
                statusText = '大额分投';
                break;
            case 5:
                statusText = '模拟投注';
                break;
            case 6:
                statusText = '单笔补单';
                break;
            case 7:
                statusText = '金额不足';
                break;
            case 8:
                statusText = '手动投注';
                break;
            case 9:
                statusText = '暂停';
                break;
            case 11:
                statusText = '待合并';
                break;
            case 13:
                statusText = '受理中';
                break;
        }
        return statusText;
    }


    _instance.LoadTotalWinClass = function (m) {
        var cls = '';
        if (m == 0) {
            return '';
        }
        else if (m < 0) {
            cls = ' class="text-primary-d2"';
        } else {
            cls = ' class="text-pink-d2"';
        }
        return cls;
    }

    _instance.LoadTotal = function (sxxxx) {
        var value = -1;
        if (sxxxx == undefined) {
            value = $('#dropdown_game_total_fa' + _instance.ctr_game).val();
            if (!value) {
                return;
            }
        }
        var url = "api/pk/report?pk_id=" + _instance.pk_id + "&game=" + _instance.game_id + "&index=" + value;
        GetApi(url, null, function (res) {
            if (res && res.ret == 200) {
                var game_total_body = $('#game_total_body' + _instance.ctr_game);
                var game_total_body_item = $('#game_total_body_item' + _instance.ctr_game);

                game_total_body.html('');
                game_total_body_item.html('');

                for (var i = 0; i < res.data.all.length; i++) {
                    var row = res.data.all[i];

                    var tr = '<tr class="bgc-h-pink-l3">\
                            <td>' + row.type + '</td>\
                            <td>' + row.count + '</td>\
                            <td>' + row.money + '</td>\
                            <td'+ _instance.LoadTotalWinClass(row.max_win) + '>' + row.max_win + '</td>\
                            <td'+ _instance.LoadTotalWinClass(row.min_win) + '>' + row.min_win + '</td>\
                            <td'+ _instance.LoadTotalWinClass(row.total_win) + '>' + row.total_win + '</td>\
                          </tr>'
                    game_total_body.append(tr);
                }
                for (var i = 0; i < res.data.items.length; i++) {
                    var row = res.data.items[i];

                    var cls = '';
                    if (row.real_win < 0 || row.vir_money < 0 || row.vir_win < 0 || row.vir_total < 0) {
                        cls = ' class="text-primary-d2"';
                    } else {
                        cls = ' class="text-pink-d2"';
                    }
                    var tr = ' <tr class="bgc-h-pink-l3">\
                                <td>' + row.qh + '</td>\
                                <td>' + row.real_count + '</td>\
                                <td>' + row.real_money + '</td>\
                                <td'+ _instance.LoadTotalWinClass(row.real_win) + '>' + row.real_win + '</td>\
                                <td'+ _instance.LoadTotalWinClass(row.real_total) + '>' + row.real_total + '</td>\
                                <td>' + row.vir_count + '</td>\
                                <td>' + row.vir_money + '</td>\
                                <td'+ _instance.LoadTotalWinClass(row.vir_win) + '>' + row.vir_win + '</td>\
                                <td'+ _instance.LoadTotalWinClass(row.vir_total) + '>' + row.vir_total + '</td>\
                            </tr>';
                    game_total_body_item.append(tr);
                }
                var _parent = game_total_body_item.parents('table');

                _parent.aceScroll();
            }
        });
    }
    _instance.UpdateIssueObj = function (obj) {

        try {
            if (obj.hasOwnProperty("qh") && obj.fptime > 0) {
                _instance.IssueObj = obj;
            }
            var game_switch = false;
            if (obj.gameSwitch == 2) {
                game_switch = true;
            }

            if ($("#game_switch" + _instance.ctr_game).prop('checked') != game_switch) {
                $("#game_switch" + _instance.ctr_game).prop('checked', game_switch);
            }
            if ($("#game_moni" + _instance.ctr_game).prop('checked') != obj.analog_flag) {
                $("#game_moni" + _instance.ctr_game).prop('checked', obj.analog_flag);
            }
            if ($("#game_vis_odds" + _instance.ctr_game).prop('checked') != obj.vis_odds) {
                $("#game_vis_odds" + _instance.ctr_game).prop('checked', obj.vis_odds);
            }
        } catch (e) {

        }
    }

    _instance.UpdateOption = function (gameOp) {
        //var gameOp = parent.L_Configs.gameOption[game_id];        
        $('#game_st_stop_add' + _instance.ctr_game).prop('checked', gameOp.stopnew_game);

        $('#starttime' + _instance.ctr_game).val(gameOp.auto_start.value);
        $('#game_st_time_start_flag' + _instance.ctr_game).prop('checked', gameOp.auto_start.flag);

        $('#endtime' + _instance.ctr_game).val(gameOp.auto_stop.value);
        $('#game_st_time_stop_falg' + _instance.ctr_game).prop('checked', gameOp.auto_stop.flag);
        $('#game_vis_odds' + _instance.ctr_game).val(gameOp.vis_odds);
    }
    _instance.Close = function () {
        if (_instance.listTimes.length > 0) {
            for (var i = 0; i < _instance.listTimes.length; i++) {
                var row = _instance.listTimes[i];
                window.clearInterval(row.id);
                console.log("game_close->timeid:" + row.id + ",type:" + row.type);
            }
        }
    }
    _instance.softwareType = 0;
    _instance.Init = function (loadIndex) {
        var apiStore = ApiStorage();

        _instance.softwareType = apiStore.login.softwareType;
        if (_instance.softwareType == 0) {
            $('#game_ui_st_stop_add' + _instance.ctr_game).addClass('d-none');
            $('#pk_game_chongfuxiazhu' + _instance.ctr_game).addClass('d-none');
            $('#dropdown_game_total_fa' + _instance.ctr_game).parent().addClass('d-none');
            $('#game_total_sx' + _instance.ctr_game).parent().removeClass('d-none');
        } else {
            $('#game_total_sx2' + _instance.ctr_game).parent().removeClass('d-none');
        }
        $('#game_total_sx' + _instance.ctr_game + ',#game_total_sx2' + _instance.ctr_game).on('click', function () {
            var game_total_card = $('#game_total_card' + _instance.ctr_game);

            game_total_card.aceCard('startLoading', '<div class="pos-rel text-center position-center"><div class="pos-rel p-2"><i class="bs-card-loading-icon fa fa-spinner fa-spin fa-2x text-white"></i><br /><span class="text-white">数据更新中...</span></div></div>');

            setTimeout(function () {
                _instance.LoadTotal(true);
                game_total_card.aceCard('stopLoading');
            }, 350);
        });

        $("#starttime" + _instance.ctr_game).bind("click", function () {
            $.jeDate(this, {
                trigger: false, isTime: true, format: 'hh:mm', choosefun: function () {

                }, okfun: function () {
                    var text = $('#starttime' + _instance.ctr_game).val();

                    _instance.WriteConfig(
                        Constants.memberChanged.game_auto_start_time,
                        _instance.game_id,
                        0,
                        text,
                        false);
                }
            });
        });
        $("#endtime" + _instance.ctr_game).bind("click", function () {
            $.jeDate(this, {
                trigger: false, isTime: true, format: 'hh:mm', choosefun: function () {
                }, okfun: function () {
                    var text = $('#endtime' + _instance.ctr_game).val();

                    _instance.WriteConfig(
                        Constants.memberChanged.game_auto_stop_time,
                        _instance.game_id,
                        0,
                        text,
                        false);
                }
            });
        });

        //$('#nav-menus' + _instance.ctr_game).find('.nav-item').each(function () {

        //});


        $('#fa_total_reload' + _instance.ctr_game).on('click', function () {
            _instance.LoadTotal();
        });

        var schemeSize = top.window.L_APISTORAGE.login.schemeSize;

        var faEl = '<option value="-1">整个方案</option>';
        for (var i = 1; i <= schemeSize; i++) {

            var text = i;
            if (i < 10) {
                text = '00' + i;
            }
            else if (i < 100) {
                text = '0' + i;
            }
            faEl += '<option value="' + (i - 1) + '">方案' + text + '</option>';
        }
        _instance.FaCtrlOptionEl = faEl;

        $('#dropdown_game_total_fa_dy' + _instance.ctr_game).html(_instance.FaCtrlOptionEl.replace('整个方案', "当前所有方案"));
        $('#dropdown_game_total_fa_dy' + _instance.ctr_game).val('-1');

        $('#dropdown_game_total_fa' + _instance.ctr_game).html(_instance.FaCtrlOptionEl);

        $('#dropdown_game_total_fa' + _instance.ctr_game).change(function () {
            _instance.LoadTotal();
        });

        $('#dropdown_game_total_fa' + _instance.ctr_game).val(-1);

        //$('#aside-fa-total' + _instance.ctr_game).aceAside({
        //    placement: 'br',
        //    dismiss: true,
        //    fade: true,
        //    belowNav: true,
        //    extraClass: 'my-2'
        //});

        $('#game_kj_by_left' + _instance.ctr_game).on('click', function () {
            var content = $('#game_kj_by_content' + _instance.ctr_game);

            content.hide("slow", function () {
                $('#game_kj_by_right' + _instance.ctr_game).show('slow');
            });
            //content.hide("slide", { direction: "left", width: 0 }, 5000, function () {
            //    $('#game_kj_by_right').show(800);
            //});
        });
        $('#game_kj_by_right' + _instance.ctr_game).on('click', function () {
            var content = $('#game_kj_by_content' + _instance.ctr_game);

            $('#game_kj_by_right' + _instance.ctr_game).hide('slow');
            content.show("slow", function () { });

            //$('#game_kj_by_right').hide(500);
            //content.show("slide", { direction: "left" }, 1000, function () {});
        });

        $('#btn_rerepeat_dy' + _instance.ctr_game).on('click', function () {
            var value = $('#dropdown_game_total_fa_dy' + _instance.ctr_game).val();
            if (value == "" || value == undefined) {
                AlertError('请选择方案!');
                return;
            }
            OperConfirm('本期投注记录全部,订单将重复提交一次，确认重复下注？', function (flag) {
                if (flag) {
                    var id = AlertRequeting();
                    var url = "api/pk/repeat?pk_id=" + _instance.pk_id + "&game=" + _instance.game_id + "&index=" + value;
                    GetApi(url, null, function (res) {
                        AlertRequetingClose(id);
                        if (res.ret == 200) {
                            AlertSuccess(res.msg);
                        } else {
                            AlertError(res.msg);
                        }
                    });
                }
            });
        });

        $('#tb_bet_scroll' + _instance.ctr_game).scroll(function () {

            var top = $(this).scrollTop();

            if (_instance.isScrollTimeId != 0) {
                window.clearInterval(_instance.isScrollTimeId);
            }
            _instance.isScrollTimeId = setInterval(function () {
                _instance.isScroll = false;
            }, 5000);

            if (top == 0) {

                if (_instance.isPageEnd) {
                    return;
                }
                _instance.currentPage++;
                var card_bet_reocrd = $('#card_bet_reocrd' + _instance.ctr_game);

                card_bet_reocrd.aceCard('startLoading');
                _instance.LoadBet('more', "", function () {

                    setTimeout(function () {
                        card_bet_reocrd.aceCard('stopLoading');
                    }, 300);
                    if (!_instance.isPageEnd) {
                        var tb_bet_scroll = $('#tb_bet_scroll' + _instance.ctr_game);
                        tb_bet_scroll.animate({ scrollTop: tb_bet_scroll[0].scrollHeight / 2.5 }, 300, function () { });
                    }
                });
            }
        });

        $('#btn_sd_bet' + _instance.ctr_game).on('click', function () {
            var card_bets = $('#card_bets' + _instance.ctr_game);
            var txt_sd_money = $('#txt_sd_money' + _instance.ctr_game);
            var txt_sd_weizhi = $('#txt_sd_weizhi' + _instance.ctr_game);
            var txt_sd_haoma = $('#txt_sd_haoma' + _instance.ctr_game);

            if (txt_sd_money.val() == '' || txt_sd_money.val() == -1 || txt_sd_money.val().length == 0) {
                txt_sd_money.focus();
                card_bets.aceCard('stopLoading');
                return;
            }
            if (txt_sd_weizhi.val().trim() == '' || txt_sd_weizhi.val().trim().length == 0) {
                txt_sd_weizhi.focus();
                card_bets.aceCard('stopLoading');
                return;
            }
            if (txt_sd_haoma.val().trim() == '' || txt_sd_haoma.val().trim().length == 0) {
                txt_sd_haoma.focus();
                card_bets.aceCard('stopLoading');
                return;
            }
            card_bets.aceCard('startLoading');
            var json = {
                pk_id: _instance.pk_id,
                game: _instance.game_id,
                number: txt_sd_haoma.val(),
                weizhi: txt_sd_weizhi.val(),
                use: Number(txt_sd_money.val())
            };
            PostApi('api/pk/bet', json, function (res) {
                if (res.ret == 200) {
                    PlayMusic('force_bet.wav');
                    PlayMusic('bet_ok.wav');
                    AlertSuccess(res.msg);
                } else {
                    PlayMusic('bet_fail.wav');
                    AlertError(res.msg);
                }
                card_bets.aceCard('stopLoading');
            });
        });

        $('#btn_sdbets_box' + _instance.ctr_game).on('click', function () {

            var tp = '<div class="justify-content-center">\
                        <div class="card w-100" id="card_bets">\
                            <div class="card-body  p-1">\
                                <div class="text-dark-m2">\
                                    <h5>手动投注</h5>\
                                </div>\
                                <div class="form-group" style="width:10rem">\
                                    <div class="input-floating-label text-blue-d2 brc-blue-m1">\
                                        <input type="number" placeholder="投注金额" class="form-control form-control-lg shadow-none" id="txt_sd_money">\
                                        <span class="floating-label text-grey-m3">\
                                            投注金额(整数)\
                                        </span>\
                                    </div>\
                                </div>\
                                <div class="form-group" >\
                                    <div class="input-floating-label text-blue-d2 brc-blue-m1">\
                                        <input type="text" placeholder="投注位置" class="form-control form-control-lg shadow-none" id="txt_sd_weizhi">\
                                        <span class="floating-label text-grey-m3">\
                                            投注位置(如:1,2,3,4,5)\
                                        </span>\
                                    </div>\
                                </div>\
                                <div class="form-group" >\
                                    <div class="input-floating-label text-blue-d2 brc-blue-m1">\
                                        <input type="text" placeholder="投注位置" class="form-control form-control-lg shadow-none" id="txt_sd_haoma">\
                                        <span class="floating-label text-grey-m3">\
                                            投注号码(如:7,8,9,10)\
                                        </span>\
                                    </div>\
                                </div>\
                                <div class="text-center ">\
                                    <button class="btn btn-primary w-90" data-action="reload" id="btn_sd_bet">手动投注</button>\
                                </div>\
                            </div>\
                        </div>\
                    </div>';

            var alertObj = $(tp);
            var box = bootbox.dialog({
                message: alertObj,
                onEscape: true,
                closeButton: false,
                buttons: {
                    success:
                    {
                        label: "关闭",
                        className: "btn-danger",
                        callback: function () {
                            //Example.show("uh oh, look out!")
                        }
                    }
                }
            });


            var btn_sd_bet = alertObj.find('button[id="btn_sd_bet"]');

            var txt_sd_money = alertObj.find('input[id="txt_sd_money"]');
            var txt_sd_weizhi = alertObj.find('input[id="txt_sd_weizhi"]');
            var txt_sd_haoma = alertObj.find('input[id="txt_sd_haoma"]');

            var card_bets = alertObj.find('div[id="card_bets"]');

            btn_sd_bet.bind('click', function () {

                if (txt_sd_money.val() == '' || txt_sd_money.val() == -1 || txt_sd_money.val().length == 0) {
                    txt_sd_money.focus();
                    card_bets.aceCard('stopLoading');
                    return;
                }
                if (txt_sd_weizhi.val().trim() == '' || txt_sd_weizhi.val().trim().length == 0) {
                    txt_sd_weizhi.focus();
                    card_bets.aceCard('stopLoading');
                    return;
                }
                if (txt_sd_haoma.val().trim() == '' || txt_sd_haoma.val().trim().length == 0) {
                    txt_sd_haoma.focus();
                    card_bets.aceCard('stopLoading');
                    return;
                }
                card_bets.aceCard('startLoading');
                var json = {
                    pk_id: _instance.pk_id,
                    game: _instance.game_id,
                    number: txt_sd_haoma.val(),
                    weizhi: txt_sd_weizhi.val(),
                    use: Number(txt_sd_money.val())
                };
                PostApi('api/pk/bet', json, function (res) {
                    if (res.ret == 200) {
                        AlertSuccess(res.msg);
                    } else {
                        AlertError(res.msg);
                    }
                    card_bets.aceCard('stopLoading');
                });
            });
        });


        _instance.listTimes.push({
            id: window.setInterval(function () {
                var check = $("#game_switch" + _instance.ctr_game).prop('checked');
                if (check) {
                    _instance.gameDaojishi();
                }
            }, 1000),
            type: "daojishi"
        });


        if (_instance.gameConfig) {
            var groupObj = _instance.gameConfig.groupConfig;

            var asdasdf = '#tb_lottery_tr' + _instance.ctr_game;
            var tb_lottery_tr = jQuery(asdasdf);


            tb_lottery_tr.html('');

            var tb_lottery_tr_str = '';
            tb_lottery_tr_str += '<th class="font-normal text-dark-d4">时间</th>';
            tb_lottery_tr_str += '<th class="font-normal text-dark-d4">期号</th>';

            for (var m = groupObj.ball_min; m <= groupObj.ball_max; m++) {
                //tb_lottery_tr_str += '<th class="font-normal text-dark-d4">' + ("第" + m + groupObj.danwei) + '</th>';
                tb_lottery_tr_str += '<th class="font-normal text-dark-d4">' + (m) + '</th>';
            }
            tb_lottery_tr.html(tb_lottery_tr_str);


            var time22 = Math.ceil(Math.random() * 5);

            if (loadIndex > 0) {
                setTimeout(function () { _instance.LoadLottery(); }, 1000 * time22);
            } else {
                _instance.LoadLottery();
            }

            _instance.listTimes.push({
                id: window.setInterval(
                    function () {
                        var check = $("#game_switch" + _instance.ctr_game).prop('checked');
                        if (check) {
                            _instance.LoadLottery();
                        }
                    }
                    , 1000 * 15)
                , type: "load_lot"
            });

            _instance.listTimes.push({
                id: window.setInterval(function () {
                    var check = $("#game_switch" + _instance.ctr_game).prop('checked');
                    if (check) {
                        _instance.LoadCurrentBets();
                    }
                }
                    , 1000 * 15),
                type: "load_bet"
            });
        }
        var tb_bet_tr_str = '';

        tb_bet_tr_str += '<th  class="font-normal text-dark-d4" width="6%">投注期数</th>';
        tb_bet_tr_str += '<th  class="font-normal text-dark-d4" width="6%">方案</th>';
        tb_bet_tr_str += '<th  class="font-normal text-dark-d4" width="6%">金额</th>';
        tb_bet_tr_str += '<th  class="font-normal text-dark-d4">投注内容</th>';
        tb_bet_tr_str += '<th  class="font-normal text-dark-d4" id="vis_odds' + _instance.ctr_game + '">赔率</th>';
        tb_bet_tr_str += '<th  class="font-normal text-dark-d4" width="6%">投注状态</th>';
        tb_bet_tr_str += '<th  class="font-normal text-dark-d4" width="8%">开奖结果</th>';
        tb_bet_tr_str += '<th  class="font-normal text-dark-d4" width="6%">盈亏</th>';
        if (_instance.softwareType != 0) {
            tb_bet_tr_str += '<th  class="font-normal text-dark-d4" width="6%">注码轮次</th>';
        }

        $('#tb_bet_tr' + _instance.ctr_game).html(tb_bet_tr_str);


        var time = Math.ceil(Math.random() * 5);

        if (loadIndex > 0) {
            setTimeout(function () {
                _instance.LoadCurrentBets();
                _instance.LoadTotal();
            }, 1000 * time);
        } else {
            _instance.LoadCurrentBets();
            _instance.LoadTotal();
        }

        _instance.bindEditChanged();

        showThemeStyle();

        _instance.get_all_em_changed(1);

        $('#nav_left_collapse').on('click', function () { _instance.get_all_em_changed(0); });

        $('#game_up_collapse' + _instance.pk_id).on('click', function () {
            setTimeout(function () {
                _instance.get_all_em_changed(1);
            }, 150);
        });
    };
    _instance.get_all_em_changed = function (t) {
        var action = $('#nav_left_collapse').children('i');
        var em = 38.18;
        em = em - _instance.get_all_em();
        $('#tb_lottery_scroll' + _instance.ctr_game).css("max-height", "calc(100vh - " + em + "em)").aceScroll({ autohide: false });

        var emmmax = "calc(100vh - " + em + "em)";
        $('#tb_bet_scroll' + _instance.ctr_game).css({
            'max-height': emmmax,
            'min-height': emmmax
        }).aceScroll({ autohide: false });
    }

    _instance.get_all_em = function () {

        var hasCollapsed = $('#nav_left_collapse').hasClass('collapsed');
        var em = 0;
        if (hasCollapsed) {
            em += 4.0;
        }
        var _this = $('#game_up_collapse' + _instance.pk_id);
        var collapseSize = _this.attr('collapse-size');
        var hasUp = _this.children('i').hasClass('fa-caret-up');
        if (hasUp) {
            if (collapseSize != undefined && collapseSize == 1) {
                em += 8.2;
            }
        } else {
            if (collapseSize != undefined && collapseSize == 1) {
                em += 8.2;
            } else {
                em += 22.0;
            }
        }

        return em;
    }

    return _instance;

}