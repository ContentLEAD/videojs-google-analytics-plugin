///<reference path='ILoadingTimeObserver.ts'/>
///<reference path='../definitions/JQuery.d.ts'/>
///<reference path='../../bower_components/videojs-plugin-components/vjsplugincomponents.d.ts'/>

module GoogleAnalytics {
    export class LoadingTimeObserver {
        _player;
        _timer: VjsPluginComponents.ITimer;
        static name: string = "loadingTimeObserver";

        constructor(player, timer: VjsPluginComponents.ITimer) {
            this._timer = timer;
            player.on("canplay", this._timer.stop);
            player.on("canplaythrough", this._timer.stop);
            player.on("playing", this._timer.stop);
            player.on("waiting", this._timer.start);
        }
    }
}