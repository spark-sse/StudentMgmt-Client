import { Component, OnInit, ChangeDetectionStrategy } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";
import { Subject, Observable, BehaviorSubject } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { CourseConfigService, CourseParticipantsService, GroupDto, GroupSettingsDto, GroupsService, ParticipantDto } from "../../../../../api";
import { getRouteParam } from "../../../../../utils/helper";
import { CourseFacade } from "../../../course/services/course.facade";
import { ParticipantFacade } from "../../../course/services/participant.facade";
import { Group } from "../../../domain/group.model";
import { Participant } from "../../../domain/participant.model";
import { UnsubscribeOnDestroy } from "../../../shared/components/unsubscribe-on-destroy.component";
import { SnackbarService } from "../../../shared/services/snackbar.service";
import { CreateGroupStudentDialog } from "../../dialogs/create-group-student/create-group-student.dialog";
import { CreateGroupDialog } from "../../dialogs/create-group/create-group.dialog";

class GroupFilter {
	name?: string;
	username?: string;
	onlyClosed?: boolean;
	onlyOpen?: boolean;
}

@Component({
	selector: "app-group-list",
	templateUrl: "./group-list.component.html",
	styleUrls: ["./group-list.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroupListComponent extends UnsubscribeOnDestroy implements OnInit {

	participant$: Observable<Participant>;
	private participant: Participant;

	private groupsSubject = new BehaviorSubject<Group[]>([]);
	groups$ = this.groupsSubject.asObservable();

	private groups: Group[] = [];
	groupSettings: GroupSettingsDto;
	
	filter = new GroupFilter();
	nameFilterChangedSubject = new Subject();
	filterSubject = new Subject();

	/** Amount of groups loaded per request. */
	batchSize = 30;
	/** True, if all groups were loaded. */
	isFinished = false;
	/** Count of groups matching the filter. */
	totalCount = 0;

	courseId: string;
	
	constructor(private dialog: MatDialog,
				public participantFacade: ParticipantFacade,
				private courseFacade: CourseFacade,
				private groupService: GroupsService,
				private courseConfig: CourseConfigService,
				private courseParticipantsService: CourseParticipantsService,
				private snackbar: SnackbarService,
				private router: Router,
				private route: ActivatedRoute) { super(); }

	ngOnInit(): void {
		this.courseId = getRouteParam("courseId", this.route);
		this.participant$ = this.participantFacade.participant$;
		this.subs.sink = this.participant$.subscribe(p => this.participant = p);

		this.loadGroups();

		this.subs.sink = this.nameFilterChangedSubject.pipe(debounceTime(300))
			.subscribe(() => this.filterSubject.next());

		this.subs.sink = this.filterSubject.subscribe(() => {
			this.loadInitialGroups();
		});

		this.subs.sink = this.courseFacade.course$.subscribe(course => {
			this.groupSettings = course?.groupSettings;
		});
	}

	onScroll(): void {
		//console.log("Scrolled");
		if (this.isFinished) {
			return;
		} else {
			//console.log("Loading groups");
			this.loadGroups();
		}
	}

	/**
	 * Loads the first batch of groups according to the current filters.
	 * Clears the total count and current groups.
	 */
	private loadInitialGroups(): void {
		this.totalCount = 0;
		this.groups = [];
		this.isFinished = false;
		this.loadGroups();
	}

	/**
	 * Loads a batch of groups.
	 * If all groups were loaded, `isFinished` will be set true.
	 */
	private loadGroups(): void {
		let isClosed = undefined;
		if (this.filter?.onlyOpen) {
			isClosed = false;
		} else if (this.filter.onlyClosed) {
			isClosed = true;
		}

		this.groupService.getGroupsOfCourse(
			this.courseId, 
			this.groups.length,
			this.batchSize, 
			this.filter.name,
			isClosed,
			undefined, undefined,
			"response"
		).subscribe(response => {
			this.groups = [...this.groups, ...response.body.map(g => new Group(g))];
			this.totalCount = parseInt(response.headers.get("x-total-count"));

			this.groupsSubject.next(this.groups);

			if (this.totalCount === this.groups.length) {
				this.isFinished = true;
			}
		});
	}

	/**
	 * Opens up a group creation dialog depending on the user's course role.
	 */
	openCreateGroupDialog(): void {
		if (this.participant.role === ParticipantDto.RoleEnum.STUDENT) {
			this.openCreateGroupDialog_Student();
		} else {
			this.openCreateGroupDialog_LecturerOrTutor();
		}
	}

	/**
	 * Calls the API to remove the given group and updates the `groups` list.
	 */
	onRemoveGroup(group: GroupDto): void {
		this.groupService.deleteGroup(this.courseId, group.id).subscribe({
			next: () => {
				this.groups = this.groups.filter(g => g.id !== group.id);
				this.snackbar.openSuccessMessage();
			},
			error: error => {
				console.log(error);
				this.snackbar.openErrorMessage();
			}
		});
	}

	/**
	 * Calls the API to add the given participant to the given group.
	 */
	onAddParticipant(event: { group: GroupDto; participant: ParticipantDto }): void {
		console.log(`Adding ${event.participant.username} to ${event.group.name}.`);

		this.groupService.addUserToGroup(
			{ password: undefined }, // Password not required for lecturers/tutors
			this.courseId, 
			event.group.id, 
			event.participant.userId).subscribe({
			next: () => {
				this.snackbar.openSuccessMessage();
				const index = this.groups.findIndex(g => g.id === event.group.id);
				this.groups[index] = new Group({
					...this.groups[index],
					members: [...this.groups[index].members, event.participant]
				});
				//this.groups = [...this.groups];
			},
			error: (error) => {
				console.log(error);
				this.snackbar.openErrorMessage();
			}
		});
	}

	private openCreateGroupDialog_Student(): void {
		const dialogRef = this.dialog.open(CreateGroupStudentDialog, { data: this.courseId });
		dialogRef.afterClosed().subscribe(
			result => {
				if (result) {
					this.router.navigate(["courses", this.courseId, "groups", result.id]);
				}
			}
		);
	}

	private openCreateGroupDialog_LecturerOrTutor(): void {
		const dialogRef = this.dialog.open(CreateGroupDialog, { data: this.courseId });
		dialogRef.afterClosed().subscribe(
			result => {
				if (result) {
					this.loadInitialGroups();
				}
			}
		);
	}

}
