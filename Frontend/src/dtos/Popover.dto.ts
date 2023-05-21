import { Socket } from "socket.io-client";

export type Placement = 'top' | 'bottom' | 'start' | 'end';
export type AutoClose = boolean | 'inside' | 'outside';
export type Target = undefined | HTMLElement | string;

export class PopoverConfig {
	placement: Placement;
	autoClose: AutoClose;
	classId: string;
	positionTarget: Target;
	title: string | null | undefined;
	data: any;

	constructor(
		positionTarget: Target,
		classId: string = '',
		autoClose: AutoClose = true,
		placement: Placement = 'top',
		data: any = undefined,
		title: string | null | undefined = undefined,
	) {
		this.positionTarget = positionTarget;
		this.classId = classId;
		this.autoClose = autoClose;
		this.placement = placement;
		this.data = data;
		this.title = title;
	}
}
