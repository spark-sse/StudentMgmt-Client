import { createAction, props } from "@ngrx/store";
import { AuthResultDto, CourseDto, CredentialsDto, UserDto } from "@student-mgmt/api-client";

export const login = createAction("[Login] Login", props<{ user: UserDto }>());

export const logout = createAction("[Logout] Logout");

export const setCourses = createAction("[User] Set Courses", props<{ courses: CourseDto[] }>());
