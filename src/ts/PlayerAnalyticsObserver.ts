///<reference path='IPlayerAnalyticsObserver.ts'/>
///<reference path='ILoadingTimeObserver.ts'/>
///<reference path='../definitions/JQuery.d.ts'/> 
///<reference path='../../bower_components/videojs-plugin-components/vjsplugincomponents.d.ts'/>

module GoogleAnalytics {
    export class PlayerAnalyticsObserver implements IPlayerAnalyticsObserver {
        _pointsToTrigger: number[];
        _eventHasFired;
        _triggeredPoints: any[];
        _category: string;
        _watchTriggerIndex: number;
        _title: string;
        _analytics: any[];
        _player: VjsPluginComponents.IPlayer;
        _seeked: boolean = false;
        _seeking: boolean = false;
        _loadingTimer: ILoadingTimeObserver;
        _singlePointEventRepository: VjsPluginComponents.IObservableRepository;
        static name: string = "playerAnalyticsObserver";

        constructor(player: VjsPluginComponents.IPlayer, analytics, loadingTimer: ILoadingTimeObserver, singlePointEventRepository: VjsPluginComponents.IObservableRepository) {
            
            try {
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
            }
            catch (error) {
                this._player.trigger("error", error);
            }
        }

        // This could all could be refactored into separate objects. Perhaps one for each event?
        // For now though, the interface to this object seems fine and extra work can be put off til later. 
        private setupEvents() {
            this._player.on("action", (elem) => { this.reportSingleEvent(elem.args.name) });

            this._player.on("play", () => { this.reportSingleEvent("Play") });
            this._player.on("pause", () => { this.reportEvent("Pause") });
            this._player.on("error", () => { this.reportEvent("Error") });

            this._player.on("share", (elem) => { this.reportEvent("Share_" + elem.args.share) });
            this._player.on("changeresolution", () => { this.reportQualityChangeEvent() });

            // These were the orignial methods for those below. Typescript doesn't seem to like them though.
            // $(window).on("beforeunload", this.reportLoadingDurationEvent.bind(this));
            // $(window).on("beforeunload", this.reportVideoDepartTimeEvent.bind(this));

            //$(window).unload(() => { this.reportLoadingDurationEvent() });
            //$(window).unload(() => { this.reportVideoDepartTimeEvent() });

            this._player.on("seeking", () => { this._seeking = true });
            this._player.on("playing", () => { this._seeking = false });
            this._player.on("canplay", () => { this._seeking = false });
            this._player.on("canplaythrough", () => { this._seeking = false });

            if (typeof this._player.duration() !== "undefined") {
                this.resetTimingEvents();
            }

            this._player.on("durationset", () => { this.resetTimingEvents() });
        }

        resetTimingEvents() {
            this._singlePointEventRepository.clear();

            //Basic array of points to trigger timing events on. The points near the beginning of the video are more important than those after.
            //TODO: Make this array effectively infinite. I wish Javascript had infinite sets like those in Python or F#
            var pointsToTrigger = [0.5, 5, 10, 15, 30, 45, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360, 390, 420, 450, 480, 510, 540, 570, 600, 630, 660, 690, 720, 750, 780, 810, 840, 870, 900, 930, 960, 990, 1020, 1050, 1080, 1110, 1140, 1170, 1200];

            var buildTimeWatchedEventHandler = (time) => () => { this.reportTimeWatchedEvent(time) };

            //Remove points that fall outside the video length.
            while (pointsToTrigger.length > 0 && pointsToTrigger[0]< this._player.duration()) {
                var time = pointsToTrigger.shift();

                var singlePointEvent: VjsPluginComponents.ISinglePointEvent = {
                    time: time,
                    handler: buildTimeWatchedEventHandler(time),
                    maxCallCount: 1
                };

                this._singlePointEventRepository.create(singlePointEvent);
            }

            var singlePointEvent: VjsPluginComponents.ISinglePointEvent = {
                time: this._player.duration(),
                handler: () => { this.reportEndOfVideoEvent() },
                maxCallCount: 1
            };

            this._singlePointEventRepository.create(singlePointEvent);
        }

        reportEvent(action: string) {
            var id = this._player.getVideo().id;
            this._analytics.push(['_trackEvent', this._category, id + "_" + action, this._title]);
            if(typeof ga !== 'undefined'){
                ga('send', 'event', this._category, id + "_" + action, this._title);
            }
        }

        reportSingleEvent(action: string) {
            if (!this._eventHasFired[action]) {
                var id = this._player.getVideo().id;
                this._analytics.push(['_trackEvent', this._category, id + "_" + action, this._title]);
                if(typeof ga !== 'undefined'){
                    ga('send', 'event', this._category, id + "_" + action, this._title);
                }
                this._eventHasFired[action] = true;
            }
        }

        //TODO: check this method works with gaq. google analytics object. The gaq might not be expecting a string for the time.
        reportLoadingDurationEvent() {
            var id = this._player.getVideo().id;
                var time : number = (this._loadingTimer.getTime() * 1000);
                this._analytics.push(['_trackTiming', this._category, id + "_" + "LoadingDuration", time.toString(), this._title, "100"]);
            }

        //TODO: check this method works with gaq. google analytics object. The gaq might not be expecting a string for the time.
            reportVideoDepartTimeEvent() {
                var time = this._player.currentTime() * 1000;
                var id = this._player.getVideo().id;
                this._analytics.push(['_trackTiming', this._category, id + "_" + "TimeAtDepart", time.toString(), this._title, "100"]);
            }

            reportQualityChangeEvent() {
                var id = this._player.getVideo().id;
                this._analytics.push(['_trackEvent', this._category, id + "_" + "QualityChange_" + this._player.getVideo().getPlayingSource().resolution, this._title]);
                if(typeof ga !== 'undefined'){
                    ga('send', 'event', this._category, id + "_" + "QualityChange_" + this._player.getVideo().getPlayingSource().resolution, this._title);
                }
            }

            reportTimeWatchedEvent(time: number) {
                var id = this._player.getVideo().id;
                this._analytics.push(['_trackEvent', this._category, id + "_" + "VideoWatched_" + time.toString(), this._title]);
                if(typeof ga !== 'undefined'){
                    ga('send', 'event', this._category, id + "_" + "VideoWatched_" + time.toString(), this._title);
                }
                this._triggeredPoints.push(time);
            }

            reportEndOfVideoEvent() {
                this.reportSingleEvent("EndOfVideoReached");
            }
    }
}