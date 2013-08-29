///<reference path='ILoadingTimeObserver.ts'/>
///<reference path='../common/ITimer.ts'/>
///<reference path='../common/Timer.ts'/>
///<reference path='../common/DateService.ts'/>
///<reference path='../../../definitions/JQuery.d.ts'/>

module GoogleAnalytics {
    export class LoadingTimeObserver {
        _player;
        _timer: Common.ITimer;
        static name: string = "loadingTimeObserver";

        constructor(player, timer: Common.ITimer) {
            this._timer = timer;
            player.on("canplay", this._timer.stop);
            player.on("canplaythrough", this._timer.stop);
            player.on("playing", this._timer.stop);
            player.on("waiting", this._timer.start);
        }
    }
}