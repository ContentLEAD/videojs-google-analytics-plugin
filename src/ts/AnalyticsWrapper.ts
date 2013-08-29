declare var _gaq: any[];

module GoogleAnalytics {
    export class XArray {
        length: number;

        constructor() {
            Array.apply(this, arguments);
            return [];
        }

        pop(): any { return "" };
        push(val): number { return 0; };
    }

    export class AnalyticsWrapper extends XArray {
        
        push(val): number {
            _gaq.push(val);
            return super.push(val);
        };
    }
}