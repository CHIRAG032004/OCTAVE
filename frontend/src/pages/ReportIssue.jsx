import React, { useState } from 'react'
import uploadImage from '../utils/uploadImage';
import { useAuth } from '../hooks/useAuth';
import { SignedIn, SignedOut, SignInButton } from '../components/AuthComponents';
import { createIssue } from '../api/Issues';
import { useRuntimeStatus } from '../hooks/useRuntimeStatus';

const ReportIssue = () => {
    const [fileName, setFileName] = useState('No file chosen');
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState({ type: '', message: '' });
    const { getToken, user } = useAuth();
    const runtimeStatus = useRuntimeStatus();


    const [file, setFile] = useState(null);
    const [formData, setFormData] = useState({
        userMessage: '',
        coordinates: null,
        imageUrl: null,
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (file && file.size > 1024 * 1024) {
            setFeedback({ type: 'error', message: 'Please choose an image smaller than 1 MB.' });
            e.target.value = '';
            setFileName('No file chosen');
            setFile(null);
            return;
        }

        setFileName(file ? file.name : 'No file chosen');
        setFile(file);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setFeedback({ type: '', message: '' });
            const token = await getToken();

            if (!token) {
                console.error('No token found - user not authenticated');
                setFeedback({ type: 'error', message: 'Please sign in to report an issue.' });
                return;
            }
            // try {
            //     await testAuth(token);
            //     console.log('✅ Authentication successful');
            // } catch (authError) {
            //     console.error('❌ Authentication failed:', authError);
            //     alert('Authentication failed. Please sign in again.');
            //     return;
            // }

            if (!file) {
                setFeedback({ type: 'error', message: 'Please select an image.' });
                return;
            }

            // Get location first
            const coordinates = await new Promise((resolve, reject) => {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            const { latitude, longitude } = position.coords;
                            resolve({ latitude, longitude });
                        },
                        (error) => {
                            reject(error);
                        }
                    );
                } else {
                    setFeedback({ type: 'error', message: 'Location permission is required to report an issue.' });
                }
            });
            console.log('Uploading image...');
            const imageData = await uploadImage(file, token);

            console.log('Creating issue...');
            const issueData = {
                userMessage: formData.userMessage,
                coordinates,
                imageUrl: imageData.url,
            };
            const userId = user.$id;
            await createIssue(issueData, token, userId);

            // Clear form
            setFormData({ userMessage: '', coordinates: null, imageUrl: null });
            setFile(null);
            setFileName('No file chosen');

            const notes = [];
            if (!runtimeStatus?.features?.openRouter) {
                notes.push('AI categorization fallback was used');
            }
            if (!runtimeStatus?.features?.openCage) {
                notes.push('city/state lookup fallback was used');
            }
            if (!runtimeStatus?.features?.cloudinary) {
                notes.push('image stored on local backend storage');
            }

            setFeedback({
                type: 'success',
                message: notes.length
                    ? `Issue reported successfully. Note: ${notes.join(', ')}.`
                    : 'Issue reported successfully!'
            });

        } catch (error) {
            console.error("Error reporting issue:", error);
            const errorMessage =
                error.response?.data?.error ||
                error.response?.data?.msg ||
                error.message;
            setFeedback({ type: 'error', message: `Failed to report issue: ${errorMessage}` });
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4 text-gray-700">Report Issue</h1>
            {runtimeStatus?.warnings?.length ? (
                <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    <p className="font-medium">Some optional services are in fallback mode.</p>
                    <p className="mt-1">Issue reporting will still work, but AI categorization, geocoding, or cloud uploads may be limited.</p>
                </div>
            ) : null}
            {feedback.message ? (
                <div className={`mb-4 rounded-md px-4 py-3 text-sm ${
                    feedback.type === 'error'
                        ? 'border border-red-200 bg-red-50 text-red-700'
                        : 'border border-green-200 bg-green-50 text-green-700'
                }`}>
                    {feedback.message}
                </div>
            ) : null}
            <ol className="mb-6 list-decimal pl-6 text-gray-700">
                <li>Tap <strong>Take Photo</strong> and capture a photo of the problem using your camera.</li>
                <li>(Optional) Write a few words to explain what’s wrong.</li>
                <li>Tap <strong>Submit Report</strong> to send it.</li>
            </ol>

            <SignedOut>
                <div className="text-center py-12">
                    <p className="mb-4 text-gray-600">Please sign in to report an issue</p>
                    <SignInButton mode="modal">
                        <span className="bg-yellowOrange text-white px-6 py-3 rounded-full hover:bg-amber-500 transition inline-block cursor-pointer">
                            Sign In
                        </span>
                    </SignInButton>
                </div>
            </SignedOut>

            <SignedIn>
                <form onSubmit={handleFormSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Take Photo
                        </label>
                        <div className="flex flex-col gap-4">
                            <input
                                accept="image/*"
                                type="file"
                                capture="environment"
                                id="camera-upload"
                                className="block"
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                            />
                            <label
                                htmlFor="camera-upload"
                                className="cursor-pointer bg-gray-100 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-200 transition w-fit"
                            >
                                Take Photo
                            </label>
                            <span id="file-name" className="text-gray-600 line-clamp-1 text-sm">{fileName}</span>
                            {file && (
                                <img
                                    src={URL.createObjectURL(file)}
                                    alt="Preview"
                                    className="max-h-48 rounded-md border border-gray-200"
                                />
                            )}
                        </div>
                    </div>
                    <label htmlFor="issue-description" className="block text-sm font-medium text-gray-700 mb-1">
                        Add Message (optional)
                    </label>
                    <textarea
                        placeholder="Describe the issue..."
                        value={formData.userMessage}
                        onChange={(e) => setFormData({ ...formData, userMessage: e.target.value })}
                        className="w-full h-40 outline-none p-2 border border-gray-300 rounded-md mb-4 resize-none"
                    />
                    <button
                        type="submit"
                        className="bg-yellowOrange cursor-pointer text-white px-6 py-3 rounded-full hover:opacity-80 transition-opacity"
                    >
                        {loading ? 'Reporting...' : 'Submit Report'}
                    </button>
                    {
                        loading && <p className="text-gray-600 mt-2">Please wait, this might take few seconds...</p>
                    }
                </form>
            </SignedIn>
        </div>
    );
};

export default ReportIssue
