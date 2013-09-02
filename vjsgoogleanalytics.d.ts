/// <reference path="../../src/definitions/JQuery.d.ts" />
/// <reference path="../../bower_components/videojs-plugin-components/vjsplugincomponents.d.ts" />
/// <reference path="../../src/definitions/VideoJS.d.ts" />
declare module GoogleAnalytics {
    class XArray {
        public length: number;
        constructor();
        public pop(): any;
        public push(val): number;
    }
    class AnalyticsWrapper extends XArray {
        public push(val): number;
    }
}
declare module GoogleAnalytics {
    interface ILoadingTimeObserver {
        getTime(): number;
    }
}
declare module GoogleAnalytics {
    interface IPlayerAnalyticsObserver {
    }
}
declare module GoogleAnalytics {
    class LoadingTimeObserver {
        public _player;
        public _timer: VjsPluginComponents.ITimer;
        static name: string;
        constructor(player, timer: VjsPluginComponents.ITimer);
    }
}
declare module GoogleAnalytics {
    class PlayerAnalyticsObserver implements GoogleAnalytics.IPlayerAnalyticsObserver {
        public _pointsToTrigger: number[];
        public _eventHasFired;
        public _triggeredPoints: any[];
        public _category: string;
        public _watchTriggerIndex: number;
        public _title: string;
        public _analytics: any[];
        public _player: VjsPluginComponents.IPlayer;
        public _seeked: boolean;
        public _seeking: boolean;
        public _loadingTimer: GoogleAnalytics.ILoadingTimeObserver;
        public _singlePointEventRepository: VjsPluginComponents.IObservableRepository;
        static name: string;
        constructor(player: VjsPluginComponents.IPlayer, analytics, loadingTimer: GoogleAnalytics.ILoadingTimeObserver, singlePointEventRepository: VjsPluginComponents.IObservableRepository);
        private setupEvents();
        public resetTimingEvents(): void;
        public reportEvent(action: string): void;
        public reportSingleEvent(action: string): void;
        public reportLoadingDurationEvent(): void;
        public reportVideoDepartTimeEvent(): void;
        public reportQualityChangeEvent(): void;
        public reportTimeWatchedEvent(time: number): void;
        public reportEndOfVideoEvent(): void;
    }
}
declare module GoogleAnalytics {
    class Plugin {
        public _player: VjsPluginComponents.IPlayer;
        constructor(player);
        public enable(): void;
    }
}
