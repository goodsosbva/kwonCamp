const Review = require('../models/review')
const Campground = require('../models/campground')

module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review)
    await review.save();
    await campground.save();
    req.flash('success', 'Successfully updated review!');
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteReview = async (req, res) => {
    const {id, reviewId} = req.params;
    // 조건에 맞는 특정 리뷰만 가져오게 하는것  $pull
    await Campground.findByIdAndUpdate(id, {$pull: { reviews: reviewId}})
    await Review.findByIdAndDelete(req.params.reviewId);
    req.flash('success', 'Successfully delete review!');
    res.redirect(`/campgrounds/${id}`)
}