/**
 * @file User data fetching utilities
 */

export type User = {
	id: number;
	firstName: string;
	lastName: string;
	maidenName?: string;
	age: number;
	gender: string;
	email: string;
	phone: string;
	username: string;
	password: string;
	birthDate: string;
	image: string;
	bloodGroup: string;
	height: number;
	weight: number;
	eyeColor: string;
	hair: {
		color: string;
		type: string;
	};
	domain: string;
	ip: string;
	address: {
		address: string;
		city: string;
		state: string;
		stateCode: string;
		postalCode: string;
		coordinates: {
			lat: number;
			lng: number;
		};
		country: string;
	};
	macAddress: string;
	university: string;
	bank: {
		cardExpire: string;
		cardNumber: string;
		cardType: string;
		currency: string;
		iban: string;
	};
	company: {
		department: string;
		name: string;
		title: string;
		address: {
			address: string;
			city: string;
			state: string;
			stateCode: string;
			postalCode: string;
			coordinates: {
				lat: number;
				lng: number;
			};
			country: string;
		};
	};
	ein: string;
	ssn: string;
	userAgent: string;
};

export type UsersResponse = {
	users: User[];
	total: number;
	skip: number;
	limit: number;
};

/**
 * Fetches users from the dummyjson API
 * @returns Promise resolving to users response
 * @throws Response error if fetch fails or data is invalid
 */
export async function fetchUsers(): Promise<UsersResponse> {
	const response = await fetch("https://dummyjson.com/users");

	if (!response.ok) {
		throw new Response("Failed to load users", {
			status: response.status,
		});
	}

	const usersData: UsersResponse = await response.json();

	if (!usersData || !usersData.users) {
		throw new Response("Users data not found", {
			status: 404,
			statusText: "Users data not found",
		});
	}

	return usersData;
}

/**
 * Fetches a single user by ID from the dummyjson API
 * @param userId - The ID of the user to fetch
 * @returns Promise resolving to user data
 * @throws Response error if fetch fails or user is not found
 */
export async function fetchUserById(userId: string): Promise<User> {
	const response = await fetch(`https://dummyjson.com/users/${userId}`);

	if (!response.ok) {
		throw new Response(null, {
			status: response.status === 404 ? 404 : 500,
			statusText:
				response.status === 404
					? "User not found"
					: "Failed to fetch user",
		});
	}

	const user: User = await response.json();

	if (!user || !user.id) {
		throw new Response(null, {
			status: 404,
			statusText: "User data not found",
		});
	}

	return user;
}

