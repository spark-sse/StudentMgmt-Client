import { createReducer, on } from "@ngrx/store";
import { AuthResultDto, UserDto } from "@student-mgmt/api-client";
import * as AuthActions from "./auth.actions";

export const authFeatureKey = "auth";

export interface State {
	user: UserDto | null;
}

export const initialState: State = {
	user: null
};

export const reducer = createReducer(
	initialState,
	on(
		AuthActions.login,
		(_state, action): State => ({
			user: action.user
		})
	),
	on(
		AuthActions.logout,
		(_state): State => ({
			user: null
		})
	),
	on(AuthActions.setCourses, (state, action) => ({
		...state,
		user: {
			...state.user,
			courses: action.courses
		}
	}))
);
