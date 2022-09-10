import { chartType } from '../constants';

import Amplitude from './amplitude';
import AE from './ae';
import Wave from './wave';
import Phase from './phase';
import Fly from './fly';
import PRP2D from './prp2d';
import PRP3D from './prp3d';
import PRPSD from './prpsd';
import Cycle from './cycle';
import Mech from './mech';
import Dashboard from './dashboard';
import TEV from './tev';
import Temperature from './temperature';
import Sphere from './sphere';
import Battery from './battery';
import Infrared from './infrared';
import Audio from './audio';
import Pulse from './pulse';
import Pdischarge from './pdischarge';
import DischargeTimes from './dischargetimes';
import Compression from './compression';

export let chartOption = (targetEl, opts) => {
    let chart = {};
    switch (opts.type) {
        case chartType.ae:
            chart = new AE(opts, targetEl);
            break;
        case chartType.amplitude:
            chart = new Amplitude(opts, targetEl);
            break;
        case chartType.wave:
            chart = new Wave(opts, targetEl);
            break;
        case chartType.phase:
            chart = new Phase(opts, targetEl);
            break;
        case chartType.fly:
            chart = new Fly(opts, targetEl);
            break;
        case chartType.prpd2d:
        case chartType.prps2d:
            chart = new PRP2D(opts, targetEl);
            break;
        case chartType.prpd3d:
        case chartType.prps3d:
            chart = new PRP3D(opts, targetEl);
            break;
        case chartType.prpsd:
            chart = new PRPSD(opts, targetEl);
            break;
        case chartType.cycle:
            chart = new Cycle(opts, targetEl);
            break;
        case chartType.dashboard:
        case chartType.earthcurrent:
            chart = new Dashboard(opts, targetEl);
            break;
        case chartType.tev:
            chart = new TEV(opts, targetEl);
            break;
        case chartType.temperature:
            chart = new Temperature(opts, targetEl);
            break;
        case chartType.sphere:
            chart = new Sphere(opts, targetEl);
            break;
        case chartType.mech:
            chart = new Mech(opts, targetEl);
            break;
        case chartType.battery:
            chart = new Battery(opts, targetEl);
            break;
        case chartType.infrared:
            chart = new Infrared(opts, targetEl);
            break;
        case chartType.audio:
            chart = new Audio(opts, targetEl);
            break;
        case chartType.pulse:
            chart = new Pulse(opts, targetEl);
            break;
        case chartType.pdischarge:
            chart = new Pdischarge(opts, targetEl);
            break;
        case chartType.dischargetimes:
            chart = new DischargeTimes(opts, targetEl);
            break;
        case chartType.compression:
            chart = new Compression(opts, targetEl);
            break;
    }
    return chart.option();
}