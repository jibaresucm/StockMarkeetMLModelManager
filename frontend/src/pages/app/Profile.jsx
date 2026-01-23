export default function Profile() {
  const user = {
    name: "Marco Antonio Perez Neira",
    email: "carlos@example.com",
    role: "Standard user",
    memberSince: "March 2024",
  }

  return (
    <div className="max-w-3xl space-y-10">

      {/* Header */}
      <section>
        <h1 className="text-2xl font-semibold">
          Profile
        </h1>
        <p className="mt-2 text-slate-400">
          Manage your personal information and account settings.
        </p>
      </section>

      {/* Profile info */}
      <section className="rounded-lg border border-slate-800 bg-slate-900 p-6 space-y-6">
        <h2 className="text-lg font-medium">
          Personal information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <ProfileItem label="Full name" value={user.name} />
          <ProfileItem label="Email address" value={user.email} />
          <ProfileItem label="Role" value={user.role} />
          <ProfileItem label="Member since" value={user.memberSince} />
        </div>
      </section>

      {/* Actions */}
      <section className="flex flex-wrap gap-4">
        <button className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 font-medium transition">
          Edit profile
        </button>

        <button className="px-4 py-2 rounded-md border border-slate-700 text-slate-300 hover:bg-slate-900 transition">
          Change password
        </button>
      </section>

    </div>
  )
}


function ProfileItem({ label, value }) {
  return (
    <div>
      <p className="text-sm text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-base font-medium text-slate-100">
        {value}
      </p>
    </div>
  )
}
