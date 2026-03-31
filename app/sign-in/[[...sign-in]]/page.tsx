import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen bg-background items-center justify-center p-4">
      <div className="absolute inset-0 z-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <div className="w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] opacity-30 pointer-events-none" />
      </div>
      
      <div className="z-10 relative mt-[-5vh]">
        <SignIn 
            appearance={{ 
                baseTheme: dark,
                elements: {
                    card: "bg-card border-border border shadow-2xl",
                    headerTitle: "text-foreground font-playfair font-bold",
                    headerSubtitle: "text-muted-foreground",
                    dividerText: "text-muted-foreground",
                    formFieldLabel: "text-foreground font-medium",
                    formFieldInput: "bg-background border-input focus:ring-ring text-foreground",
                    footerActionText: "text-muted-foreground",
                    footer: "hidden"
                }
            }} 
            path="/sign-in" 
            routing="path" 
            signUpUrl="/sign-up" 
        />
      </div>
    </div>
  );
}
