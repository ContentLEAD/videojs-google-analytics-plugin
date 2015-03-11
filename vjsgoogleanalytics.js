var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var GoogleAnalytics;
(function (GoogleAnalytics) {
    var XArray = (function () {
        function XArray() {
            Array.apply(this, arguments);
            return [];
        }
        XArray.prototype.pop = function () {
            return "";
        };
        XArray.prototype.push = function (val) {
            return 0;
        };
        return XArray;
    })();
    GoogleAnalytics.XArray = XArray;

    var AnalyticsWrapper = (function (_super) {
        __extends(AnalyticsWrapper, _super);
        function AnalyticsWrapper() {
            _super.apply(this, arguments);
        }
        AnalyticsWrapper.prototype.push = function (val) {
            if (window["_gaq"]) {
                _gaq.push(val);
            }
            return _super.prototype.push.call(this, val);
        };
        return AnalyticsWrapper;
    })(XArray);
    GoogleAnalytics.AnalyticsWrapper = AnalyticsWrapper;
})(GoogleAnalytics || (GoogleAnalytics = {}));
var GoogleAnalytics;
(function (GoogleAnalytics) {
    var LoadingTimeObserver = (function () {
        function LoadingTimeObserver(player, timer) {
            this._timer = timer;
            player.on("canplay", this._timer.stop);
            player.on("canplaythrough", this._timer.stop);
            player.on("playing", this._timer.stop);
            player.on("waiting", this._timer.start);
        }
        LoadingTimeObserver.name = "loadingTimeObserver";
        return LoadingTimeObserver;
    })();
    GoogleAnalytics.LoadingTimeObserver = LoadingTimeObserver;
})(GoogleAnalytics || (GoogleAnalytics = {}));
var GoogleAnalytics;
(function (GoogleAnalytics) {
    var PlayerAnalyticsObserver = (function () {
        function PlayerAnalyticsObserver(player, analytics, loadingTimer, singlePointEventRepository) {
            this._seeked = false;
            this._seeking = false;
            try  {
                this._eventHasFired = { Play: false };
                this._category = "Videos";
                this._watchTriggerIndex = 0;
                this._title = location.pathname.substring(1);
                this._player = player;
                this._analytics = analytics;
                this._triggeredPoints = [];
                this._loadingTimer = loadingTimer;
                this._singlePointEventRepository = singlePointEventRepository;
                this.setupEvents();
            } catch (error) {
                this._player.trigger("error", error);
            }
        }
        PlayerAnalyticsObserver.prototype.setupEvents = function () {
            var _this = this;
            this._player.on("action", function (elem) {
                _this.reportSingleEvent(elem.args.name);
            });

            this._player.on("play", function () {
                _this.reportSingleEvent("Play");
            });
            this._player.on("pause", function () {
                _this.reportEvent("Pause");
            });
            this._player.on("error", function () {
                _this.reportEvent("Error");
            });

            this._player.on("share", function (elem) {
                _this.reportEvent("Share_" + elem.args.share);
            });
            this._player.on("changeresolution", function () {
                _this.reportQualityChangeEvent();
            });

            this._player.on("seeking", function () {
                _this._seeking = true;
            });
            this._player.on("playing", function () {
                _this._seeking = false;
            });
            this._player.on("canplay", function () {
                _this._seeking = false;
            });
            this._player.on("canplaythrough", function () {
                _this._seeking = false;
            });

            if (typeof this._player.duration() !== "undefined") {
                this.resetTimingEvents();
            }

            this._player.on("durationset", function () {
                _this.resetTimingEvents();
            });
        };

        PlayerAnalyticsObserver.prototype.resetTimingEvents = function () {
            var _this = this;
            this._singlePointEventRepository.clear();

            var pointsToTrigger = [0.5, 5, 10, 15, 30, 45, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360, 390, 420, 450, 480, 510, 540, 570, 600, 630, 660, 690, 720, 750, 780, 810, 840, 870, 900, 930, 960, 990, 1020, 1050, 1080, 1110, 1140, 1170, 1200];

            var buildTimeWatchedEventHandler = function (time) {
                return function () {
                    _this.reportTimeWatchedEvent(time);
                };
            };

            while (pointsToTrigger.length > 0 && pointsToTrigger[0] < this._player.duration()) {
                var time = pointsToTrigger.shift();

                var singlePointEvent = {
                    time: time,
                    handler: buildTimeWatchedEventHandler(time),
                    maxCallCount: 1
                };

                this._singlePointEventRepository.create(singlePointEvent);
            }

            var singlePointEvent = {
                time: this._player.duration(),
                handler: function () {
                    _this.reportEndOfVideoEvent();
                },
                maxCallCount: 1
            };

            this._singlePointEventRepository.create(singlePointEvent);
        };

        PlayerAnalyticsObserver.prototype.reportEvent = function (action) {
            var id = this._player.getVideo().id;
            this._analytics.push(['_trackEvent', this._category, id + "_" + action, this._title]);
            if(typeof ga !== 'undefined'){
                ga('send', 'event', this._category, id + "_" + action, this._title);
            }
        };

        PlayerAnalyticsObserver.prototype.reportSingleEvent = function (action) {
            if (!this._eventHasFired[action]) {
                var id = this._player.getVideo().id;
                this._analytics.push(['_trackEvent', this._category, id + "_" + action, this._title]);
                if(typeof ga !== 'undefined'){
                    ga('send', 'event', this._category, id + "_" + action, this._title);
                }
                this._eventHasFired[action] = true;
            }
        };

        PlayerAnalyticsObserver.prototype.reportLoadingDurationEvent = function () {
            var id = this._player.getVideo().id;
            var time = (this._loadingTimer.getTime() * 1000);
            this._analytics.push(['_trackTiming', this._category, id + "_" + "LoadingDuration", time.toString(), this._title, "100"]);
        };

        PlayerAnalyticsObserver.prototype.reportVideoDepartTimeEvent = function () {
            var time = this._player.currentTime() * 1000;
            var id = this._player.getVideo().id;
            this._analytics.push(['_trackTiming', this._category, id + "_" + "TimeAtDepart", time.toString(), this._title, "100"]);
        };

        PlayerAnalyticsObserver.prototype.reportQualityChangeEvent = function () {
            var id = this._player.getVideo().id;
            this._analytics.push(['_trackEvent', this._category, id + "_" + "QualityChange_" + this._player.getVideo().getPlayingSource().resolution, this._title]);
            if(typeof ga !== 'undefined'){
                ga('send', 'event', this._category, id + "_" + "QualityChange_" + this._player.getVideo().getPlayingSource().resolution, this._title);
            }
        };

        PlayerAnalyticsObserver.prototype.reportTimeWatchedEvent = function (time) {
            var id = this._player.getVideo().id;
            this._analytics.push(['_trackEvent', this._category, id + "_" + "VideoWatched_" + time.toString(), this._title]);
            if(typeof ga !== 'undefined'){
                ga('send', 'event', this._category, id + "_" + "VideoWatched_" + time.toString(), this._title);
            }
            this._triggeredPoints.push(time);
        };

        PlayerAnalyticsObserver.prototype.reportEndOfVideoEvent = function () {
            this.reportSingleEvent("EndOfVideoReached");
        };
        PlayerAnalyticsObserver.name = "playerAnalyticsObserver";
        return PlayerAnalyticsObserver;
    })();
    GoogleAnalytics.PlayerAnalyticsObserver = PlayerAnalyticsObserver;
})(GoogleAnalytics || (GoogleAnalytics = {}));
var GoogleAnalytics;
(function (GoogleAnalytics) {
    var Plugin = (function () {
        function Plugin(player) {
            this._player = new VjsPluginComponents.Player(player);
        }
        Plugin.prototype.enable = function () {
            var _this = this;
            var applyServiceToPlayer = VjsPluginComponents.ApplySingleService(this._player);

            var durationEmitter = applyServiceToPlayer("DurationSetEmitter")(function () {
                return new VjsPluginComponents.DurationSetEmitter(_this._player);
            });

            var singlePointEventRepository = applyServiceToPlayer("SinglePointEventRepository")(function () {
                return new VjsPluginComponents.SinglePointEventRepository(new VjsPluginComponents.ObservableRepository(new VjsPluginComponents.Observable()));
            });

            var timeBasedEventRepository = applyServiceToPlayer("TimeBasedEventRepository")(function () {
                return new VjsPluginComponents.TimeBasedEventRepository(new VjsPluginComponents.ObservableRepository(new VjsPluginComponents.Observable()), singlePointEventRepository);
            });

            var eventManager = applyServiceToPlayer("TimeBasedEventManager")(function () {
                var singlePointEventList = new VjsPluginComponents.WalkableList(VjsPluginComponents.EventSortingFunction, function (a) {
                    return (typeof a.maxCallCount === "undefined") || a.maxCallCount > a.callCount;
                }, singlePointEventRepository);

                return new VjsPluginComponents.TimeBasedEventManager(new VjsPluginComponents.PlayObserver(_this._player), singlePointEventList, timeBasedEventRepository);
            });

            var singlePointEventSubRepository = new VjsPluginComponents.ObservableSubRepository(singlePointEventRepository, new VjsPluginComponents.Observable());

            var loadingObserver = applyServiceToPlayer("LoadingTimeObserver")(function () {
                return new GoogleAnalytics.LoadingTimeObserver(_this._player, new VjsPluginComponents.Timer(window, new VjsPluginComponents.DateService()));
            });

            var playerAnalyticsObserver = applyServiceToPlayer("PlayerAnalyticsObserver")(function () {
                return new GoogleAnalytics.PlayerAnalyticsObserver(_this._player, new GoogleAnalytics.AnalyticsWrapper(), loadingObserver, singlePointEventSubRepository);
            });
        };
        return Plugin;
    })();
    GoogleAnalytics.Plugin = Plugin;
})(GoogleAnalytics || (GoogleAnalytics = {}));
_V_.plugin("googleAnalyticsPlugin", function (options) {
    var plugin = new GoogleAnalytics.Plugin(this);
    plugin.enable();
});
//# sourceMappingURL=file:////home/travis/build/Axonn/videojs-google-analytics-plugin/build/js/vjsgoogleanalytics.js.map
