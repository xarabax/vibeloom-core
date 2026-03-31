import { VibeLoomWizard } from "@/components/vibeloom-wizard"
import { UserButton } from "@clerk/nextjs"

export default function Home() {
  return (
    <>
      <div className="absolute top-4 right-4 z-50">
        <UserButton />
      </div>
      <VibeLoomWizard />
    </>
  )
}
