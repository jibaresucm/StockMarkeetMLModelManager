export default function Profile({ user }) {
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
      <section className="rounded-lg border border-slate-800 bg-indigo-900 p-6 space-y-6">
        <h2 className="text-lg font-medium text-gray-100">
          Personal information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <ProfileItem label="Username" value={user?.username ?? ""} />
          <ProfileItem label="Email address" value={user?.email ?? ""} />
          <ProfileItem
            label="Member since"
            value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : ""}
          />
        </div>
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
