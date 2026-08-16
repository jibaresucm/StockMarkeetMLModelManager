import { User } from "lucide-react"

export default function Profile({ user }) {
  return (
    <div className="max-w-3xl space-y-8">

      {/* Header */}
      <section>
        <h1 className="text-2xl font-bold text-slate-900">
          Profile
        </h1>
        <p className="mt-2 text-slate-600">
          Manage your personal information and account settings.
        </p>
      </section>

      {/* Profile info */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50">
            <User size={26} className="text-indigo-600" />
          </span>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {user?.username ?? ""}
            </h2>
            <p className="text-sm text-slate-500">Personal information</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-slate-100 pt-6">
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
      <p className="text-sm text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-base font-medium text-slate-900">
        {value}
      </p>
    </div>
  )
}
