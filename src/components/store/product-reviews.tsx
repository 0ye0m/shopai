'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Star, ThumbsUp, MessageSquare, Sparkles, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  title: string;
  body: string;
  isVerified: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    avatar: string | null;
  };
}

interface RatingDistribution {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
}

interface ProductReviewsProps {
  productId: string;
  reviews: Review[];
  ratingDistribution: RatingDistribution;
  averageRating: number;
  totalReviews: number;
}

export function ProductReviews({
  productId,
  reviews: initialReviews,
  ratingDistribution,
  averageRating,
  totalReviews,
}: ProductReviewsProps) {
  const [reviews, setReviews] = useState(initialReviews);
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStarClick = (rating: number) => {
    setNewRating(rating);
  };

  const handleSubmitReview = async () => {
    if (newRating === 0) {
      toast.error('Please select a rating');
      return;
    }
    if (!newTitle.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (!newBody.trim()) {
      toast.error('Please enter your review');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          rating: newRating,
          title: newTitle,
          body: newBody,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit review');
      }

      const { review } = await response.json();
      setReviews([review, ...reviews]);
      setIsWritingReview(false);
      setNewRating(0);
      setNewTitle('');
      setNewBody('');
      toast.success('Review submitted successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const totalRatings = Object.values(ratingDistribution).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Rating Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Customer Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Average Rating */}
            <div className="text-center md:text-left">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {averageRating.toFixed(1)}
              </div>
              <div className="flex items-center justify-center md:justify-start gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(averageRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-500">
                Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = ratingDistribution[rating as keyof RatingDistribution] || 0;
                const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
                
                return (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 w-3">{rating}</span>
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <Progress value={percentage} className="h-2 flex-1" />
                    <span className="text-sm text-gray-500 w-12">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Write Review Button */}
          <div className="mt-6 pt-6 border-t">
            <Button 
              onClick={() => setIsWritingReview(!isWritingReview)}
              className="w-full md:w-auto"
            >
              {isWritingReview ? 'Cancel' : 'Write a Review'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Write Review Form */}
      {isWritingReview && (
        <Card>
          <CardHeader>
            <CardTitle>Write Your Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Rating Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Your Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleStarClick(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        star <= newRating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300 hover:text-yellow-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2">Review Title</label>
              <Input
                placeholder="Summarize your experience"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>

            {/* Body */}
            <div>
              <label className="block text-sm font-medium mb-2">Your Review</label>
              <Textarea
                placeholder="Tell others about your experience with this product..."
                rows={4}
                value={newBody}
                onChange={(e) => setNewBody(e.target.value)}
              />
            </div>

            <Button 
              onClick={handleSubmitReview} 
              disabled={isSubmitting}
              className="w-full md:w-auto"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* AI Review Summary Placeholder */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <span className="font-semibold text-purple-900">AI Review Summary</span>
          </div>
          <p className="text-sm text-purple-800">
            Based on customer reviews, this product is highly rated for its quality and value. 
            Most customers appreciate the durability and design, though some mention concerns about sizing.
          </p>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="max-h-96">
            <div className="space-y-4 pr-4">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                          {review.user.avatar ? (
                            <Image
                              src={review.user.avatar}
                              alt={review.user.name || 'User'}
                              width={40}
                              height={40}
                              className="object-cover"
                            />
                          ) : (
                            <User className="h-5 w-5 text-gray-500" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">
                            {review.user.name || 'Anonymous'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(review.createdAt)}
                          </div>
                        </div>
                      </div>
                      {review.isVerified && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          Verified Purchase
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>

                    <h4 className="font-semibold mb-1">{review.title}</h4>
                    <p className="text-gray-600 text-sm">{review.body}</p>

                    <div className="flex items-center gap-4 mt-4">
                      <Button variant="ghost" size="sm" className="text-gray-500">
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        Helpful
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
