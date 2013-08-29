/// <reference path="../../../definitions/Jasmine.d.ts" />
/// <reference path="../../../definitions/JQuery.d.ts" />
/// <reference path="../../../definitions/Require.d.ts" />
/// <chutzpah_reference path="../../../lib/JQuery/jquery-1.9.1.js" />
/// <reference path="../../../local/plugins/googleanalytics/PlayerAnalyticsObserver.ts" />
/// <reference path="../../../local/plugins/vjsplugin/IObservableRepository.ts" />

describe("player analytics observer", function () {
    var curriedGetFunctionFromSpy = (spy: jasmine.Spy) => {
        return (functionName: string) => {
            for (var i = 0; i < spy.argsForCall.length; i++) {
                if (spy.argsForCall[i][0] === functionName) {
                    return spy.argsForCall[i][1];
                };
            }
        };
    }

    var player: VjsPlugin.IPlayer;
    var triggerEventSpy;
    var playerEventSpy;
    var getVideoSpy;
    var analytics;
    var currentTimeSpy;
    var durationSpy;
    var idSpy;
    var playerId;
    var videoId;
    var eventRepository: VjsPlugin.IObservableRepository;
    var createEventSpy;

    beforeEach(() => {
        videoId = "video1";
        playerId = "player1";
        analytics = [];
        playerEventSpy = jasmine.createSpy('playerEvent');
        triggerEventSpy = jasmine.createSpy('triggerEvent');
        getVideoSpy = jasmine.createSpy("player.getVideo").andReturn({
            id: videoId
        });
        currentTimeSpy = jasmine.createSpy("player.currentTime");
        durationSpy = jasmine.createSpy("player.duration");
        idSpy = jasmine.createSpy("player.id").andReturn(playerId);
        createEventSpy = jasmine.createSpy('eventRepo.create')
        eventRepository = {
                remove: jasmine.createSpy('eventRepo.remove'),
                getEntity: jasmine.createSpy('eventRepo.getEntity'),
                create: createEventSpy,
                trigger: jasmine.createSpy('eventRepo.trigger'),
                on: jasmine.createSpy('eventRepo.on'),
                toList: jasmine.createSpy('eventRepo.toList'),
                update: jasmine.createSpy('eventRepo.update'),
                clear: jasmine.createSpy('eventRepo.clear'),
            }

        player = {
            on: playerEventSpy,
            setVideo: jasmine.createSpy("player.setVideo"),
            getVideo: getVideoSpy,
            changeSrcResetTime: jasmine.createSpy("player.changeSrcResetTime"),
            changeSrcRetainTime: jasmine.createSpy("player.changeSrcRetainTime"),
            currentTime: currentTimeSpy,
            id: idSpy,
            trigger: triggerEventSpy,
            dispose: jasmine.createSpy("player.dispose"),
            createEl: jasmine.createSpy("player.createEl"),
            el: jasmine.createSpy("player.el"),
            addChild: jasmine.createSpy("player.addChild"),
            children: jasmine.createSpy("player.children"),
            off: jasmine.createSpy("player.off"),
            one: jasmine.createSpy("player.one"),
            show: jasmine.createSpy("player.show"),
            hide: jasmine.createSpy("player.hide"),
            width: jasmine.createSpy("player.width"),
            height: jasmine.createSpy("player.height"),
            dimensions: jasmine.createSpy("player.dimensions"),
            techName: jasmine.createSpy("player.techName"),
            play: jasmine.createSpy("player.play"),
            lockShowing: jasmine.createSpy("player.lockShowing"),
            unlockShowing: jasmine.createSpy("player.unlockShowing"),
            currentSrc: jasmine.createSpy("player.currentSrc"),
            duration: durationSpy,
            toOriginal: jasmine.createSpy("player.duration"),
            sources: jasmine.createSpy("player.sources"),
            options: jasmine.createSpy("player.options"),
        }
    });

    it("recognises play event (using spies)", function () {
        var observer = new GoogleAnalytics.PlayerAnalyticsObserver(player, analytics, { getTime: () => { } }, eventRepository);

        curriedGetFunctionFromSpy(playerEventSpy)("play")();

        expect(analytics.pop().toString()).toBe(["_trackEvent", "Videos", videoId + "_Play", location.pathname.substring(1)].toString());
    });

    it("recognises pause event", function () {
        var observer = new GoogleAnalytics.PlayerAnalyticsObserver(player, analytics, { getTime: () => { } }, eventRepository);

        curriedGetFunctionFromSpy(playerEventSpy)("pause")();

        expect(analytics.pop().toString()).toBe(["_trackEvent", "Videos", videoId + "_Pause", location.pathname.substring(1)].toString());
    });

    it("recognises error event", function () {
        var observer = new GoogleAnalytics.PlayerAnalyticsObserver(player, analytics, { getTime: () => { } }, eventRepository);

        curriedGetFunctionFromSpy(playerEventSpy)("error")();

        expect(analytics.pop().toString()).toBe(["_trackEvent", "Videos", videoId + "_Error", location.pathname.substring(1)].toString());
    });

    it("recognises share event", function () {
        var observer = new GoogleAnalytics.PlayerAnalyticsObserver(player, analytics, { getTime: () => { } }, eventRepository);

        curriedGetFunctionFromSpy(playerEventSpy)("share")({ args: { share: "google+" } });

        expect(analytics.pop().toString()).toBe(["_trackEvent", "Videos", videoId + "_Share_google+", location.pathname.substring(1)].toString());
    });

    it("recognises quality change event", function () {
        getVideoSpy.andReturn({
            id: videoId,
            getPlayingSource: jasmine.createSpy("getPlayingSource").andReturn({
                resolution: "240p"
            })
        })

        var observer = new GoogleAnalytics.PlayerAnalyticsObserver(player, analytics, { getTime: () => { } }, eventRepository);

        curriedGetFunctionFromSpy(playerEventSpy)("changeresolution")();

        expect(analytics.pop().toString()).toBe(["_trackEvent", "Videos", videoId + "_QualityChange_240p", location.pathname.substring(1)].toString());
    });

    it("recognises generic action event", function () {
        var observer = new GoogleAnalytics.PlayerAnalyticsObserver(player, analytics, { getTime: () => { } }, eventRepository);

        curriedGetFunctionFromSpy(playerEventSpy)("action")({ args: { name: "Conversion_goal_hit" } });

        expect(analytics.pop().toString()).toBe(["_trackEvent", "Videos", videoId + "_Conversion_goal_hit", location.pathname.substring(1)].toString());
    });

    it("recognises 60 seconds video watched events", function () {
        durationSpy.andReturn(120);

        var observer = new GoogleAnalytics.PlayerAnalyticsObserver(player, analytics, { getTime: () => { } }, eventRepository);

        curriedGetFunctionFromSpy(playerEventSpy)("durationset")();

        for (var i = 0; i < createEventSpy.argsForCall.length; i++) {
            createEventSpy.argsForCall[i][0].handler();
        }

        expect(analytics.pop().toString()).toBe(["_trackEvent", "Videos", videoId + "_VideoWatched_90", location.pathname.substring(1)].toString());
        expect(analytics.pop().toString()).toBe(["_trackEvent", "Videos", videoId + "_VideoWatched_60", location.pathname.substring(1)].toString());
        expect(analytics.pop().toString()).toBe(["_trackEvent", "Videos", videoId + "_VideoWatched_45", location.pathname.substring(1)].toString());
        expect(analytics.pop().toString()).toBe(["_trackEvent", "Videos", videoId + "_VideoWatched_30", location.pathname.substring(1)].toString());
        expect(analytics.pop().toString()).toBe(["_trackEvent", "Videos", videoId + "_VideoWatched_15", location.pathname.substring(1)].toString());
        expect(analytics.pop().toString()).toBe(["_trackEvent", "Videos", videoId + "_VideoWatched_10", location.pathname.substring(1)].toString());
        expect(analytics.pop().toString()).toBe(["_trackEvent", "Videos", videoId + "_VideoWatched_5", location.pathname.substring(1)].toString());
        expect(analytics.pop().toString()).toBe(["_trackEvent", "Videos", videoId + "_VideoWatched_0.5", location.pathname.substring(1)].toString());
        expect(analytics.pop().toString()).toBe(["_trackEvent", "Videos", videoId + "_EndOfVideoReached", location.pathname.substring(1)].toString());

    });
});
