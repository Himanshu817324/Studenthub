import { BookOpen } from 'lucide-react';

function Home() {
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="container mx-auto max-w-6xl">
                <div className="flex items-center space-x-3 mb-8">
                    <BookOpen className="w-8 h-8 text-primary" />
                    <h1 className="text-3xl font-bold">Your Feed</h1>
                </div>

                <div className="glass-card p-8 text-center">
                    <h2 className="text-2xl font-semibold mb-4">Welcome to StudentHub!</h2>
                    <p className="text-gray-600 mb-4">
                        This is your personalized feed based on your interests.
                    </p>
                    <p className="text-gray-500">
                        Full implementation includes problem feed, filters, and personalized recommendations.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Home;
