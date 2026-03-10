import type { Route } from "./+types/admin.users";
import { useLoaderData, Link } from "react-router";
import { adminLoader } from "~/lib/admin.server";
import { getAllUsers } from "~/auth/users.server";
import { Users as UsersIcon, Edit, Trash2 } from "lucide-react";

export async function loader({ request }: Route.LoaderArgs) {
	await adminLoader(request);
	const users = await getAllUsers();
	return { users };
}

export default function AdminUsers() {
	const { users } = useLoaderData<typeof loader>();

	return (
		<div className="max-w-7xl mx-auto">
			{/* Header */}
			<div className="mb-6">
				<h1 className="text-3xl font-bold text-gray-900">User Management</h1>
				<p className="mt-2 text-sm text-gray-600">
					View and manage user accounts
				</p>
			</div>

			{/* Users Table */}
			{users.length === 0 ? (
				<div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
					<UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
					<p className="text-gray-500">No users found.</p>
				</div>
			) : (
				<div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Email
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Role
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Created At
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										User ID
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{users.map((user) => (
									<tr key={user.id} className="hover:bg-gray-50">
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm font-medium text-gray-900">
												{user.email}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span
												className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
													user.role === "admin"
														? "bg-purple-100 text-purple-800"
														: "bg-blue-100 text-blue-800"
												}`}
											>
												{user.role}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm text-gray-900">
												{new Date(user.createdAt).toLocaleDateString()}
											</div>
											<div className="text-xs text-gray-500">
												{new Date(user.createdAt).toLocaleTimeString()}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm text-gray-500 font-mono">
												{user.id.substring(0, 8)}...
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
											<div className="flex items-center gap-2">
												<Link
													to={`/admin/users/addedituser/${user.id}`}
													className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
													title="Edit user"
												>
													<Edit className="w-4 h-4" />
												</Link>
												{user.role !== "admin" && (
													<Link
														to={`/admin/users/deleteuser/${user.id}`}
														className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
														title="Delete user"
													>
														<Trash2 className="w-4 h-4" />
													</Link>
												)}
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}
		</div>
	);
}

