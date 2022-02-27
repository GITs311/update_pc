
function MemberPankou(pk_id, pk_name, PK_DEFAULT) {
    var _instance = new Object();
    _instance.PK_DEFAULT = {
        gamedto: [], platform: {}
    };
    _instance.PK_DEFAULT = PK_DEFAULT;
    _instance.pauseChanged = false;
    _instance.listErrors = [];
    _instance.pk_id = pk_id;
    _instance.pk_name = pk_name;
    _instance.intervalId = '';
    _instance.intervalId2 = '';
    _instance.listgamesmgr = [];
    _instance.L_Configs = {};
    _instance.offlineFlag = false;
    _instance.offlineFlag2 = false;
    _instance.pkInfo = {};
    _instance.toDecmic = function (s, def = "0") {
        if (s == null || s == undefined || s == "") {
            return def;
        }
        return parseFloat(s).toFixed(2);
    }

    _instance.showOfflineLable = function () {
        $('#lab_username' + _instance.pk_id).text('');
        $('#lab_money' + _instance.pk_id).text('');
        $('#lab_shuying' + _instance.pk_id).text('');
        $('#lab_xiazhu' + _instance.pk_id).text('');
        $('#lab_bishu' + _instance.pk_id).text('');
        $('#btn_pk_login' + _instance.pk_id).find('span').text('盘口登录');
        _instance.fuwuqiStatus("");
    }

    _instance.LoadInfo = function (async = true) {
        //console.log("----L_PLATFORMS---");
        //console.log(parent.L_PLATFORMS);
        GetApi("api/pk/i_pk?pk_id=" + _instance.pk_id, null, function (res) {
            try {

                if (res.ret == 200) {
                    var data = res.data;
                    _instance.pkInfo = data;
                    var offline = data['offline'];
                    if (offline) {
                        _instance.showOfflineLable();
                        if (_instance.offlineFlag == false) {
                            _instance.offlineFlag = true;
                            PlayMusic('offline.wav');
                        }
                        _instance.offlineFlag2 = false;

                    } else {
                        $('#lab_username' + _instance.pk_id).text(data.name);
                        $('#lab_money' + _instance.pk_id).text(_instance.toDecmic(data.rem, ""));
                        $('#lab_shuying' + _instance.pk_id).text(_instance.toDecmic(data.win, ""));
                        $('#lab_xiazhu' + _instance.pk_id).text(_instance.toDecmic(data.money, ""));
                        $('#lab_bishu' + _instance.pk_id).text(data.count);
                        if (_instance.offlineFlag2 == false) {
                            _instance.offlineFlag2 = true;
                            PlayMusic('sw_ok.wav');
                        }
                        _instance.offlineFlag = false;
                        //setTimeout(function () {
                        //    document.getElementById('login_dangerModal_dismiss').click();
                        //}, 1000);
                    }
                    if (data.hasOwnProperty('state')) {
                        if (data.state != "" && data.state.indexOf("注销") == -1) {
                            $('#btn_pk_login' + _instance.pk_id).find('span').text('盘口注销');
                        }
                    }


                    var balance = data.balance;


                    $('#yingli1' + _instance.pk_id).text(_instance.toDecmic(balance.real_money));
                    $('#yingli2' + _instance.pk_id).text(_instance.toDecmic(balance.anal_money));
                    $('#zongxiazhu' + _instance.pk_id).text(_instance.toDecmic(balance.bet_money));

                    _instance.fuwuqiStatus();

                    if (data.list) {
                        for (var gameId in data.list) {
                            if (_instance.listgamesmgr[gameId] != undefined) {
                                _instance.listgamesmgr[gameId].UpdateIssueObj(data.list[gameId]);
                            }
                        }
                    }
                }
            } catch (e) {
                console.error(e);
            }
        }, async);
    }
    _instance.fuwuqiStatus = function (status) {
        var url_index = 0;
        var statusText = '';// status;

        if (_instance.pkInfo.hasOwnProperty("url_index")) {
            url_index = _instance.pkInfo.url_index;
            if (status == undefined && _instance.pkInfo.hasOwnProperty('state')) {
                statusText = _instance.pkInfo.state;
            }
        }

        var elText = '';

        switch (statusText) {

            case '使用中':
                elText = '<span class="badge badge-sm bgc-pink-d2 text-white pb-1 px-25">使用中</span>';
                break;
            case '已注销':
                elText = '<span class="badge badge-sm bgc-warning-d2 text-white pb-1 px-25">已注销</span>';
                break;
            default:
                if (statusText != "") {
                    var tmp = statusText;
                    if (tmp.indexOf('正在登录') != -1) {
                        tmp = "连接中>>";
                    }
                    elText = '<span class="badge badge-sm bgc-warning-d2 text-white pb-1 px-25">' + tmp + '</span>';
                }
                break;
        }
        $('#fuwuqi' + _instance.pk_id).find('tr').each(function (index) {
            var el = $(this).children('td').last();
            el.html('');
            if (url_index >= 0 && index == url_index) {
                el.html(elText);
            }
        });
    }
    _instance.LoadConfig = function () {

        GetApiSync("api/pk/l_config?pk_id=" + _instance.pk_id, null, function (res) {
            try {
                if (res.ret == 200) {
                    var data = res.data;
                    _instance.L_Configs = data;


                    var loginObj = data.login;
                    var pk_dropdown_web = $("#pk_dropdown_web" + _instance.pk_id);

                    var pk_dropdown_web_str = "";
                    for (var i = 0; i < loginObj.login_pk.length; i++) {
                        var row = loginObj.login_pk[i];
                        pk_dropdown_web_str += '<option value=' + i + '>站点' + (i + 1) + '</option>';
                    }

                    pk_dropdown_web.html(pk_dropdown_web_str);

                    pk_dropdown_web.val(loginObj.route_id);

                    var login_pk = loginObj.login_pk[loginObj.route_id];

                    _instance.BindRoute(login_pk);

                    var betting = data.betting;

                    $('#pk_st_lunpan' + _instance.pk_id).prop('checked', data.corona.flag);
                    $('#pk_st_kaipanjiutou' + _instance.pk_id).prop('checked', betting.promptly_bet);

                    $('#pk_st_yiju' + _instance.pk_id).val(betting.limit_balance.zhi_type);
                    //$('#pk_st_peilv' + _instance.pk_id).prop('checked', betting.vis_odds);
                    $('#pk_st_sy' + _instance.pk_id).prop('checked', betting.play_music);
                    $('#pk_st_zhiying' + _instance.pk_id).val(betting.limit_balance.zhi_ying);
                    $('#pk_st_zhisun' + _instance.pk_id).val(betting.limit_balance.zhi_sun);
                    $('#pk_st_record_cout' + _instance.pk_id).val(betting.record_count);
                    $('#pk_st_fp' + _instance.pk_id).val(betting.dist_fptime);
                    $('#pk_st_hebing' + _instance.pk_id).prop('checked', betting.merger.merge_flag);
                    $('#pk_st_max' + _instance.pk_id).val(betting.merger.merge_max);
                    $('#pk_st_min' + _instance.pk_id).val(betting.merger.merge_min);
                    $('#pk_st_number' + _instance.pk_id).val(betting.merger.merge_number);


                    if (_instance.pk_name == "cc_new") {
                        var pk_arr_game_now = $('#pk_arr_game_now' + _instance.pk_id);

                        pk_arr_game_now.parent().prev().addClass('d-none');

                        pk_arr_game_now.parent().removeClass('d-none');

                        pk_arr_game_now.html('<option value="-1">选择游戏</option>');

                        for (var i = 0; i < _instance.PK_DEFAULT.gamedto.length; i++) {
                            var row = _instance.PK_DEFAULT.gamedto[i];
                            pk_arr_game_now.append('<option value="' + row.gameType + '">' + row.gameConfig.name + '</option>');
                        }

                        if (data.sundry != undefined && data.sundry.game_now != "" && data.sundry.game_now > 0) {
                            pk_arr_game_now.val(data.sundry.game_now);
                        }
                    }

                    var analog = data.analog;

                    $('#pk_st_zhi1' + _instance.pk_id).prop('checked', analog.tz_vir_1.flag);
                    $('#pk_st_zhi_val_1' + _instance.pk_id).val(analog.tz_vir_1.value);
                    $('#pk_st_cz1' + _instance.pk_id).prop('checked', analog.tz_vir_1.flag_2);

                    $('#pk_st_zhi2' + _instance.pk_id).prop('checked', analog.tz_vir_2.flag);
                    $('#pk_st_zhi_val_2' + _instance.pk_id).val(analog.tz_vir_2.value);
                    $('#pk_st_cz2' + _instance.pk_id).prop('checked', analog.tz_vir_2.flag_2);


                    $('#pk_st_zhi3' + _instance.pk_id).prop('checked', analog.tz_true_1.flag);
                    $('#pk_st_zhi_val_3' + _instance.pk_id).val(analog.tz_true_1.value);
                    $('#pk_st_cz3' + _instance.pk_id).prop('checked', analog.tz_true_1.flag_2);

                    $('#pk_st_zhi4' + _instance.pk_id).prop('checked', analog.tz_true_2.flag);
                    $('#pk_st_zhi_val_4' + _instance.pk_id).val(analog.tz_true_2.value);
                    $('#pk_st_cz4' + _instance.pk_id).prop('checked', analog.tz_true_2.flag_2);


                    $('#pk_st_seq' + _instance.pk_id).val(data.corona.sequence);
                    $('#pk_st_autoadd' + _instance.pk_id).prop('checked', data.corona.auto_add);

                    _instance.reSpeed();
                    _instance.intervalId2 = window.setInterval(function () {
                        _instance.reSpeed();
                    }, 8000);

                    _instance.bindEditChanged();

                }
            } catch (e) {

            }
        });
    }
    _instance.testSpeedCount = [{}];
    _instance.BindRoute = function (login_pk) {
        _instance.routeChanged(login_pk.routes);
        $('#pk_login_u112233' + _instance.pk_id).val(login_pk.username);
        $('#pk_login_p112233' + _instance.pk_id).val(login_pk.password);
        $('#pk_login_reme' + _instance.pk_id).prop('checked', login_pk.remember);
        $('#pk_login_afkey' + _instance.pk_id).val(login_pk.affkey);
    }

    _instance.testSpeed = function (text, el) {
        _instance.testSpeedColor('测速中...', el);
        var sendDate = (new Date()).getTime();
        var img = new Image(1, 1);
        img.src = text;
        img.onerror = function (e) {
            console.log('img.onerror');
            var receiveDate = (new Date()).getTime();
            var responseTimeMs = receiveDate - sendDate;
            _instance.testSpeedColor(responseTimeMs, el);
        }
    }
    _instance.testSpeedColor = function (responseTimeMs, el) {
        var color = 'text-pink';
        if (responseTimeMs != "测速中...") {
            if (responseTimeMs < 1200) {
                color = 'text-green';
            } else if (responseTimeMs < 2800) {
                color = 'text-warning';
            } else {
                color = 'text-red';
            }
            el.next().html('<span class="' + color + '">' + responseTimeMs + '/ms</span>');
        } else {
            el.next().html('<span class="' + color + '">' + responseTimeMs + '</span>');
        }
    }
    _instance.reSpeed = function () {
        var fuwuqi = $('#fuwuqi' + _instance.pk_id);

        fuwuqi.find('.view_lab').each(function (i) {
            var _this = $(this);
            var text = _this.text().trim();
            if (text.trim() != "" && (text.indexOf("http://") != -1 || text.indexOf("https://") != -1)) {
                _instance.testSpeed(text, _this);
            } else {
                _this.next().text('');
            }
        });
    }

    _instance.routeChanged = function (urls) {

        var fuwuqi_str = '';
        for (var i = 0; i < urls.length; i++) {

            var url = urls[i];

            if (url == null || url == 'null') {
                url = '';
            }

            var ctr = '<div class="pos-rel ml-sm-auto mr-sm-2 order-last order-sm-0" style="display:none;">\
                            <i class="fa fa-globe-europe position-lc ml-25 text-primary-m1"></i>\
                            <input type="text" class="form-control input-sm w-100 pl-45 radius-1 brc-primary-m4 view_text_edit" placeholder="盘口地址" value="" />\
                        </div>';

            fuwuqi_str += '<tr class="bgc-h-pink-l3">';
            fuwuqi_str += '<td  height="35" class="view_lab" style="white-space:nowrap;text-overflow:ellipsis; overflow:hidden; max-width:35rem;"><a href="#" class="text-blue-d1 text-600 text-95">' + url + '</a>' + ctr + '</td>';
            fuwuqi_str += '<td></td>';
            fuwuqi_str += '<td></td>';
            fuwuqi_str += '</tr>\n';
        }
        var fuwuqi = $('#fuwuqi' + _instance.pk_id);

        fuwuqi.html(fuwuqi_str);

        fuwuqi.find('.view_lab').each(function () {
            var _this = $(this);
            _this.on('click', function () {
                var span = _this.find("a");
                span.hide().next().show().find('.view_text_edit').val(span.text()).focus();
            });
        });
        fuwuqi.find('.view_text_edit').each(function (index) {
            var _this = $(this);
            _this.blur(function () {
                var text = _this.val();

                $(this).parent('div').hide().prev().show().text(text);
                //setTimeout(function () { window.clearInterval(ttt); _this.parents('td').next().html(''); }, 6000);

                _instance.WriteConfig(
                    Constants.dailiChanged.login_url,
                    -1,
                    index,
                    encodeURIComponent(text),
                    false, function (res) {
                        if (res) {

                        }
                    });
            });
        });
    }
    _instance.LoadGames = function () {

        var nav_games = $("#nav_games" + _instance.pk_id);
        var nav_games_iframe = $('#nav_games_iframe' + _instance.pk_id);

        nav_games.html('');
        nav_games_iframe.html('');

        var index = 0;

        //var url = __htmlRoot + '/pk/game.html?pk_id=' + _instance.pk_id + '&game_id=' + "&_=" + Date.now();

        var tpl = $('#game-tp-item' + _instance.pk_id).html();
        //$.get(url, function (tpl) {

        var tp = '';
        for (var i = 0; i < _instance.PK_DEFAULT.gamedto.length; i++) {
            tp = tpl;

            var row = _instance.PK_DEFAULT.gamedto[i];

            var html = '';

            var id = 'g_' + _instance.pk_id + '_' + row.gameType;

            var active = '';
            if (index == 0) {
                active = ' active ';
            }
            html += '<li class="nav-item mr-1">';
            html += '<a class="' + active + ' btn btn-light-primary btn-h-light-pink btn-h-text-black btn-a-blue py-2 border-1 border-b-1 radius-b-1 radius-t-2" id="' + id + '-tab-btn" data-toggle="tab" href="#' + id + '" role="tab" aria-controls="' + id + '" aria-selected="true">';
            html += '<i class="fa fa-gamepad text-success mr-3px"></i>';
            html += row.gameConfig.name;
            html += '</a>';
            html += '</li>';
            nav_games.append(html);

            var ctr_game = _instance.pk_id + '-' + row.gameType.toString();

            var gameHtml = tp.replaceTpl('{d_gameid}', ctr_game);


            var pgame = new pankouGame(_instance, ctr_game, row.gameConfig);

            var key = row.gameType.toString();

            _instance.listgamesmgr[key] = pgame;

            var paneHtml = '';
            paneHtml += '<div class="tab-pane text-95 show ' + active + '" id="' + id + '" role="tabpanel" aria-labelledby="' + id + '-tab-btn">';
            paneHtml += gameHtml;
            paneHtml += '</div>';

            nav_games_iframe.append(paneHtml);
            index++;
        }

        var collapse = '<li class="nav-item ml-auto mr-3px"><a href = "#" class="btn bgc-primary text-100" id = "game_up_collapse' + _instance.pk_id + '" > <i class="fa fa-caret-up text-150 text-white"></i></a ></li > ';
        nav_games.append(collapse);


        $('#game_up_collapse' + _instance.pk_id).on('click', function () {
            var action = $(this).children('i');
            var hasup = action.hasClass('fa-caret-up');
            var collapseSize = $(this).attr('collapse-size');
            if (collapseSize == undefined) {
                collapseSize = 2;
            }
            var parent = $(this).parents('div.col-12');
            var els = [parent.prev(), parent.prev().prev()];
            if (hasup) {
                if (collapseSize == 2) {
                    els[0].hide('slow', function () { });
                }
                if (collapseSize == 1) {
                    els[1].hide('slow', function () { });
                }
                collapseSize = collapseSize - 1;
                if (collapseSize <= 0) {
                    action.removeClass('fa-caret-up').addClass('fa-caret-down');

                    collapseSize = 2;
                }
                $(this).attr('collapse-size', collapseSize);
            } else {
                for (var i = 0; i < els.length; i++) {
                    var row = els[i];
                    row.show('slow', function () { });
                }
                action.removeClass('fa-caret-down').addClass('fa-caret-up');
                $(this).attr('collapse-size', 2);
            }

        });
        setTimeout(function () {
            var indexssss = 0;
            for (var key in _instance.listgamesmgr) {
                _instance.listgamesmgr[key].UpdateOption(_instance.L_Configs.gameOption[key]);
                _instance.listgamesmgr[key].Init(indexssss);
                indexssss++;
            }
        }, 100);

        //});
    }
    _instance.bindEditChanged = function () {
        $('#pk_dropdown_web' + _instance.pk_id).change(function () {
            var val = $(this).val();

            GetApi("api/pk/site?pk_id=" + _instance.pk_id + "&route_id=" + val, null, function (res) {
                if (res.ret == 200) {
                    _instance.L_Configs.login.route_id = val;

                    _instance.BindRoute(res.data);
                }
            });
            //_instance.WriteConfig(
            //    Constants.memberChanged.login_route_id,
            //    -1,
            //    val,
            //    '',
            //    false, function (flag) {
            //        _instance.pauseChanged = true;
            //        if (flag) {
            //            _instance.L_Configs.login.route_id = val;
            //            _instance.BindRoute(_instance.L_Configs.login);
            //        }
            //        _instance.pauseChanged = false;
            //    });
        });


        $('#pk_login_u112233' + _instance.pk_id).change(function () {
            var text = $(this).val();

            _instance.WriteConfig(
                Constants.memberChanged.login_username,
                -1,
                0,
                text,
                false);
        });

        $('#pk_login_p112233' + _instance.pk_id).change(function () {
            var text = $(this).val();

            _instance.WriteConfig(
                Constants.memberChanged.login_password,
                -1,
                0,
                text,
                false);
        });


        $('#toggle-password' + _instance.pk_id)
            .on('click', function (e) {
                e.preventDefault()
                $(this).toggleClass('active')

                var inp = document.getElementById('pk_login_p112233' + _instance.pk_id);
                inp.type = $(this).hasClass('active') ? 'text' : 'password'
                inp.focus()
            });


        $('#pk_login_afkey' + _instance.pk_id).change(function () {
            var text = $(this).val();

            _instance.WriteConfig(
                Constants.memberChanged.login_affkey,
                -1,
                0,
                text,
                false);
        });


        $('#pk_arr_game_now' + _instance.pk_id).change(function () {
            var text = $(this).val();
            _instance.WriteConfig(
                Constants.memberChanged.pk_arr_game_now,
                text,
                0,
                "",
                false);
        });

        $('#pk_login_reme' + _instance.pk_id).change(function () {
            var text = $(this).prop('checked');

            _instance.WriteConfig(
                Constants.memberChanged.login_remember,
                -1,
                0,
                '',
                text);
        });

        $('#pk_st_lunpan' + _instance.pk_id).change(function () {
            var text = $(this).prop('checked');

            _instance.WriteConfig(
                Constants.memberChanged.corona_flag,
                -1,
                0,
                '',
                text);
        });

        $('#pk_st_hebing' + _instance.pk_id).change(function () {
            var text = $(this).prop('checked');

            _instance.WriteConfig(
                Constants.memberChanged.betting_merge_flag,
                -1,
                0,
                '',
                text);
        });

        $('#pk_st_kaipanjiutou' + _instance.pk_id).change(function () {
            var text = $(this).prop('checked');

            _instance.WriteConfig(
                Constants.memberChanged.betting_promptly_bet,
                -1,
                0,
                '',
                text);
        });


        $('#pk_st_peilv' + _instance.pk_id).change(function () {
            var text = $(this).prop('checked');

            _instance.WriteConfig(
                Constants.memberChanged.betting_vis_odds,
                -1,
                0,
                '',
                text, function (flag) {
                    if (flag) {
                        _instance.L_Configs.betting.vis_odds = text;
                    }
                });
        });

        $('#pk_st_sy' + _instance.pk_id).change(function () {
            var text = $(this).prop('checked');

            _instance.WriteConfig(
                Constants.memberChanged.betting_play_music,
                -1,
                0,
                '',
                text);
        });


        $('#pk_st_zhiying' + _instance.pk_id).change(function () {
            var text = $(this).val();

            _instance.WriteConfig(
                Constants.memberChanged.betting_zhi_ying,
                -1,
                text,
                '',
                false);
        });

        $('#pk_st_zhisun' + _instance.pk_id).change(function () {
            var text = $(this).val();

            _instance.WriteConfig(
                Constants.memberChanged.betting_zhi_sun,
                -1,
                text,
                '',
                false);
        });

        $('#pk_st_yiju' + _instance.pk_id).change(function () {
            var text = $(this).val();

            _instance.WriteConfig(
                Constants.memberChanged.betting_zhi_type,
                -1,
                text,
                '',
                false);
        });

        $('#pk_st_record_cout' + _instance.pk_id).change(function () {
            var text = $(this).val();

            _instance.WriteConfig(
                Constants.memberChanged.betting_record_count,
                -1,
                text,
                '',
                false);
        });


        $('#pk_st_fp' + _instance.pk_id).change(function () {
            var text = $(this).val();

            _instance.WriteConfig(
                Constants.memberChanged.betting_dist_fptime,
                -1,
                text,
                '',
                false);
        });


        $('#pk_st_max' + _instance.pk_id).change(function () {
            var text = $(this).val();

            _instance.WriteConfig(
                Constants.memberChanged.betting_merge_max,
                -1,
                text,
                '',
                false);
        });

        $('#pk_st_min' + _instance.pk_id).change(function () {
            var text = $(this).val();

            _instance.WriteConfig(
                Constants.memberChanged.betting_merge_min,
                -1,
                text,
                '',
                false);
        });

        $('#pk_st_number' + _instance.pk_id).change(function () {
            var text = $(this).val();

            _instance.WriteConfig(
                Constants.memberChanged.betting_merge_number,
                -1,
                text,
                '',
                false);
        });

        $('#pk_st_zhi1' + _instance.pk_id).change(function () {
            var text = $(this).prop('checked');
            _instance.WriteConfig(Constants.memberChanged.analog_tz_vir_1_flag, -1, 0, '', text);
        });
        $('#pk_st_zhi_val_1' + _instance.pk_id).change(function () {
            var text = $(this).val();
            _instance.WriteConfig(Constants.memberChanged.analog_tz_vir_1_value, -1, 0, text, false);
        });
        $('#pk_st_cz1' + _instance.pk_id).change(function () {
            var text = $(this).prop('checked');
            _instance.WriteConfig(Constants.memberChanged.analog_tz_vir_1_reset, -1, 0, '', text);
        });


        $('#pk_st_zhi2' + _instance.pk_id).change(function () {
            var text = $(this).prop('checked');
            _instance.WriteConfig(Constants.memberChanged.analog_tz_vir_2_flag, -1, 0, '', text);
        });
        $('#pk_st_zhi_val_2' + _instance.pk_id).change(function () {
            var text = $(this).val();
            _instance.WriteConfig(Constants.memberChanged.analog_tz_vir_2_value, -1, 0, text, false);
        });
        $('#pk_st_cz2' + _instance.pk_id).change(function () {
            var text = $(this).prop('checked');
            _instance.WriteConfig(Constants.memberChanged.analog_tz_vir_2_reset, -1, 0, '', text);
        });

        $('#pk_st_zhi3' + _instance.pk_id).change(function () {
            var text = $(this).prop('checked');
            _instance.WriteConfig(Constants.memberChanged.analog_tz_true_1_flag, -1, 0, '', text);
        });
        $('#pk_st_zhi_val_3' + _instance.pk_id).change(function () {
            var text = $(this).val();
            _instance.WriteConfig(Constants.memberChanged.analog_tz_true_1_value, -1, 0, text, false);
        });
        $('#pk_st_cz3' + _instance.pk_id).change(function () {
            var text = $(this).prop('checked');
            _instance.WriteConfig(Constants.memberChanged.analog_tz_true_1_reset, -1, 0, '', text);
        });

        $('#pk_st_zhi4' + _instance.pk_id).change(function () {
            var text = $(this).prop('checked');
            _instance.WriteConfig(Constants.memberChanged.analog_tz_true_2_flag, -1, 0, '', text);
        });
        $('#pk_st_zhi_val_4' + _instance.pk_id).change(function () {
            var text = $(this).val();
            _instance.WriteConfig(Constants.memberChanged.analog_tz_true_2_value, -1, 0, text, false);
        });
        $('#pk_st_cz4' + _instance.pk_id).change(function () {
            var text = $(this).prop('checked');
            _instance.WriteConfig(Constants.memberChanged.analog_tz_true_2_reset, -1, 0, '', text);
        });


        $('#pk_st_seq' + _instance.pk_id).change(function () {
            var text = $(this).val();
            _instance.WriteConfig(Constants.memberChanged.corona_sequence, -1, 0, text, false);
        });

        $('#pk_st_autoadd' + _instance.pk_id).change(function () {
            var text = $(this).prop('checked');
            _instance.WriteConfig(Constants.memberChanged.corona_auto_add, -1, 0, '', text);
        });

    }
    _instance.WriteConfig = function (memberChangedType, game, p0, p1, p2, callBack = null) {
        if (_instance.pauseChanged) {
            return;
        }
        var __request = "api/pk/changed_config?pk_id=" + _instance.pk_id + "&memberChangedType=" + memberChangedType + "&game=" + game + "&p0=" + p0 + "&p1=" + p1 + "&p2=" + p2.toString().toLowerCase();
        GetApi(__request, null, function (res) {
            if (callBack != null) {
                callBack(res.ret == 200);
            }
            if (res.ret != 200) {
                var row = { memberChangedType: memberChangedType, game: game, p0: p0, p1: p1, p2: p2 };
                _instance.listErrors.push(row);
                console.error('===========WriteConfigError===========');
                console.error(row);
                //AlertError('上传失败:' + memberChangedType);
            }
        });
    }
    _instance.Close = function () {
        window.clearInterval(_instance.intervalId);
        window.clearInterval(_instance.intervalId2);
        console.log("pk_close->timeid:" + _instance.intervalId + ",type:pk");
        console.log("pk_close->timeid:" + _instance.intervalId2 + ",type:pk");
        for (var gameId in _instance.listgamesmgr) {
            var game = _instance.listgamesmgr[gameId];
            if (game != undefined) {
                game.Close();
            }
        }
    }
    _instance.init = function () {

        var apiStore = ApiStorage();

        if (apiStore.login.softwareType == 0) {
            $('#pk_kaipanjiutou' + _instance.pk_id).addClass('d-none');
            $('#pk_lunpan' + _instance.pk_id).addClass('d-none');
            $('#xxxx_004' + _instance.pk_id).addClass('d-none');
            $('#xxxx_005' + _instance.pk_id).addClass('d-none');
            //$('#pk_st_min' + _instance.pk_id).removeClass('d-none').prev('span').removeClass('d-none');
            //$('#pk_st_record_cout' + _instance.pk_id).css('width', "130px").addClass('mr-425');
            $('#pk_ui_st_cz1' + _instance.pk_id).addClass('d-none');
            $('#pk_ui_st_cz2' + _instance.pk_id).addClass('d-none');
            $('#pk_ui_st_cz3' + _instance.pk_id).addClass('d-none');
            $('#pk_ui_st_cz4' + _instance.pk_id).addClass('d-none');
        }

        $('#btn_nav_close' + _instance.pk_id).on('click', function () {
            $('#btn_nav_sb_start' + _instance.pk_id).dropdown('hide');
        });

        $('#lab_nav_pk_type' + _instance.pk_id).text(_instance.PK_DEFAULT.platform.cn);

        $('#btn_nav_sb' + _instance.pk_id).on('click', function () {
            var txt_nav_url = $('#txt_nav_url' + _instance.pk_id);
            var txt_nav_safe_code = $('#txt_nav_safe_code' + _instance.pk_id);

            var url = txt_nav_url.val();
            var code = txt_nav_safe_code.val();
            if (url == '' || url.indexOf('http') == -1) {
                //AlertError('导航地址填写不正确！');
                txt_nav_url.focus();
                return;
            }
            //var id = AlertRequeting('正在分析导航，请等候...');            
            var req = "api/pk/nav?pk_id=" + _instance.pk_id + "&url=" + encodeURIComponent(url) + "&code=" + code;
            GetApi(req, null, function (res) {
                //AlertRequetingClose(id);
                if (res) {
                    if (res.ret != 200) {
                        AlertError(res.msg);
                    } else {
                        AlertSuccess(res.msg);
                        if (res.data.length > 0) {
                            _instance.routeChanged(res.data);
                        }
                    }
                }
            });

        });

        $('#btn_save_config' + _instance.pk_id).on('click', function () {
            var url = "api/pk/save?pk_id=" + _instance.pk_id;
            PostApi(url, null, function (res) {
                if (res.ret != 200) {
                    AlertError(res.msg);
                } else {
                    PlayMusic('save.wav');
                    AlertSuccess('保存成功!');
                }
            });
        });

        $('#btn_pk_login' + _instance.pk_id).on('click', function () {
            var btn = $(this);
            var text = btn.find('span').text();
            if (text == "盘口登录") {
                if (true) {

                }
                var pk_login_u112233 = $('#pk_login_u112233' + _instance.pk_id);
                if (pk_login_u112233.val().trim() == '') {
                    pk_login_u112233.focus();
                    return;
                }

                var pk_login_p112233 = $('#pk_login_p112233' + _instance.pk_id);
                if (pk_login_p112233.val().trim() == '') {
                    pk_login_p112233.focus();
                    return;
                }
                //_instance.pkInfo.url_index
                _instance.fuwuqiStatus("正在登录");

                var url = "api/pk/login?pk_id=" + _instance.pk_id;
                PostApi(url, null, function (res) {
                    if (res.ret != 200) {
                        AlertError(res.msg);
                    } else {
                        btn.find('span').text('盘口注销');
                        PlayMusic("sw_ok.wav");
                        AlertSuccess('登录成功!');
                    }
                });
            } else {
                OperConfirm('确认注销盘口吗？', function (op) {
                    if (op) {
                        var url = "api/pk/logout?pk_id=" + _instance.pk_id;

                        GetApi(url, null, function (res) {
                            if (res.ret != 200) {
                                AlertError(res.msg);
                            } else {
                                btn.find('span').text('盘口登录');
                                AlertSuccess('注销成功!');
                                //try {
                                //    for (var key in _instance.listgamesmgr) {
                                //        _instance.listgamesmgr[key].Clear();
                                //    }
                                //} catch (e) {

                                //}
                                _instance.showOfflineLable();
                                _instance.fuwuqiStatus("已注销");            
                            }
                        });
                    }
                });
            }
        });

        _instance.LoadConfig();
        _instance.LoadGames();
        _instance.LoadInfo(false);
        _instance.intervalId = window.setInterval(_instance.LoadInfo, 1000 * 10);
        console.log(_instance.intervalId);
    };

    return _instance;
}